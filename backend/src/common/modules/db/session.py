"""
Database session management.

This module provides async database session management using SQLAlchemy.
"""
import logging
from pathlib import Path
from urllib.parse import urlparse, urlunparse, quote
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from typing import AsyncGenerator

from ..config import settings
from ..logger.handlers import create_file_handler
from ..logger.formatter import JSONFormatter


def _setup_db_pool_logger() -> logging.Logger:
    """
    Setup dedicated logger for database connection pool.
    
    This logger only writes to file (db_pool.log) and does NOT output to console.
    It is completely isolated from the root logger to avoid console output.
    
    Returns:
        Configured logger instance for database pool operations
    """
    logger = logging.getLogger("db_pool")
    # Set to DEBUG to capture all pool operations, can be adjusted via settings
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Determine backend directory path
    # backend/src/common/modules/db/session.py -> backend/
    backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    log_file = backend_dir / "logs" / "db_pool.log"
    
    # Create formatter (use JSON format for structured logging)
    formatter = JSONFormatter()
    
    # Create file handler ONLY (no console handler)
    # This ensures logs are written to file but NOT printed to console
    handler_level = logging.DEBUG if settings.DEBUG else logging.INFO
    file_handler = create_file_handler(
        str(log_file),
        formatter,
        handler_level,
        max_bytes=10485760,  # 10MB
        backup_count=5,
    )
    
    # Add ONLY file handler (no console handler)
    logger.addHandler(file_handler)
    
    # Prevent propagation to root logger to avoid console output
    logger.propagate = False
    
    return logger


# Initialize database pool logger
db_pool_logger = _setup_db_pool_logger()


def _encode_database_url(url: str) -> str:
    """
    Properly encode special characters in database URL password.
    
    This handles passwords containing special characters like % that need
    to be URL-encoded for SQLAlchemy to parse correctly.
    """
    parsed = urlparse(url)
    if parsed.password:
        # URL-encode the password (quote with safe='')
        encoded_password = quote(parsed.password, safe='')
        # Reconstruct the netloc with encoded password
        if parsed.port:
            netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}:{parsed.port}"
        else:
            netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}"
        # Reconstruct the full URL
        return urlunparse((
            parsed.scheme,
            netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
    return url


# Database connection pool configuration
POOL_SIZE = 10
MAX_OVERFLOW = 20
POOL_TIMEOUT = 30
CONNECT_TIMEOUT = 10
COMMAND_TIMEOUT = 30

# Log pool configuration
db_pool_logger.info(
    "Initializing database connection pool",
    extra={
        "pool_size": POOL_SIZE,
        "max_overflow": MAX_OVERFLOW,
        "pool_timeout": POOL_TIMEOUT,
        "connect_timeout": CONNECT_TIMEOUT,
        "command_timeout": COMMAND_TIMEOUT,
    }
)

# Create async engine with properly encoded URL
engine = create_async_engine(
    _encode_database_url(settings.DATABASE_URL),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    connect_args={
        "timeout": CONNECT_TIMEOUT,
        "command_timeout": COMMAND_TIMEOUT,
    },
)


# Setup SQLAlchemy event listeners for connection pool logging
@event.listens_for(engine.sync_engine, "connect")
def on_connect(dbapi_conn, connection_record):
    """Log when a new database connection is established."""
    db_pool_logger.debug(
        "New database connection established",
        extra={
            "connection_id": id(dbapi_conn),
        }
    )


@event.listens_for(engine.sync_engine, "checkout")
def on_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log when a connection is checked out from the pool."""
    # Only log basic connection info to avoid accessing pool attributes that may not exist
    # Accessing connection_record.pool can cause AttributeError in some SQLAlchemy versions
    try:
        db_pool_logger.debug(
            "Connection checked out from pool",
            extra={
                "connection_id": id(dbapi_conn),
            }
        )
    except Exception:
        # Silently ignore any errors in logging to prevent connection invalidation
        pass


@event.listens_for(engine.sync_engine, "checkin")
def on_checkin(dbapi_conn, connection_record):
    """Log when a connection is returned to the pool."""
    # Only log basic connection info to avoid accessing pool attributes that may not exist
    # Accessing connection_record.pool can cause AttributeError in some SQLAlchemy versions
    try:
        db_pool_logger.debug(
            "Connection returned to pool",
            extra={
                "connection_id": id(dbapi_conn),
            }
        )
    except Exception:
        # Silently ignore any errors in logging to prevent connection invalidation
        pass


@event.listens_for(engine.sync_engine, "invalidate")
def on_invalidate(dbapi_conn, connection_record, exception):
    """Log when a connection is invalidated."""
    db_pool_logger.warning(
        "Database connection invalidated",
        extra={
            "connection_id": id(dbapi_conn),
            "exception": str(exception) if exception else None,
        },
        exc_info=exception is not None,
    )


@event.listens_for(engine.sync_engine, "soft_invalidate")
def on_soft_invalidate(dbapi_conn, connection_record, exception):
    """Log when a connection is soft invalidated."""
    db_pool_logger.warning(
        "Database connection soft invalidated",
        extra={
            "connection_id": id(dbapi_conn),
            "exception": str(exception) if exception else None,
        },
    )


@event.listens_for(engine.sync_engine, "close")
def on_close(dbapi_conn, connection_record):
    """Log when a connection is closed."""
    db_pool_logger.debug(
        "Database connection closed",
        extra={
            "connection_id": id(dbapi_conn),
        }
    )


# Log engine creation success
db_pool_logger.info("Database engine created successfully")

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()

__all__ = ["engine", "AsyncSessionLocal", "Base", "get_db", "db_pool_logger"]


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.

    Yields:
        AsyncSession: Database session
    """
    db_pool_logger.debug("Creating new database session")
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
            db_pool_logger.debug("Database session committed successfully")
        except Exception as e:
            await session.rollback()
            db_pool_logger.error(
                "Database session rollback due to error",
                extra={
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                exc_info=True,
            )
            raise
        finally:
            # Session will be automatically closed by async with context manager
            db_pool_logger.debug("Database session closed")

