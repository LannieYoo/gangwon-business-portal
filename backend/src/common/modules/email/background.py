"""
Background email task using asyncio.
Sends emails without blocking the main request.
"""
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def send_email_background(coro):
    """
    Fire-and-forget email sending.
    Creates a new task that runs independently of the request.
    """
    try:
        loop = asyncio.get_running_loop()
        task = loop.create_task(_safe_send(coro))
        # Add callback to log errors
        task.add_done_callback(_handle_task_result)
        logger.info("Background email task created successfully")
    except RuntimeError as e:
        # No running loop, skip email
        logger.warning(f"No running event loop, skipping background email: {e}")


async def _safe_send(coro):
    """Wrapper to catch and log email errors."""
    try:
        logger.info("Starting background email send...")
        result = await coro
        logger.info(f"Background email sent successfully: {result}")
        return result
    except Exception as e:
        logger.error(f"Background email failed: {e}", exc_info=True)
        raise


def _handle_task_result(task):
    """Log any unhandled exceptions from the task."""
    try:
        result = task.result()
        logger.info(f"Background email task completed: {result}")
    except asyncio.CancelledError:
        logger.warning("Background email task was cancelled")
    except Exception as e:
        logger.error(f"Background email task error: {e}", exc_info=True)
