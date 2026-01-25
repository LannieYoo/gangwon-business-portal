"""依赖注入 (Deps) 规范检查器接口。"""
import ast
from abc import abstractmethod
from typing import Protocol


class IDepsChecker(Protocol):
    """依赖注入规范检查器接口。"""

    @abstractmethod
    def check_deps_functions_only(self, tree: ast.AST, file_path: str) -> None:
        """检查 Deps 文件是否只包含依赖注入函数。"""
        ...

    @abstractmethod
    def check_deps_function_naming(self, tree: ast.AST, file_path: str) -> None:
        """检查 Deps 函数命名规范。"""
        ...

    @abstractmethod
    def check_dependency_injection_pattern(self, tree: ast.AST, file_path: str) -> None:
        """检查依赖注入模式。"""
        ...

    @abstractmethod
    def check_function_dependency_pattern(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查函数的依赖注入模式。"""
        ...

    @abstractmethod
    def check_fastapi_depends_usage(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查是否正确使用了 FastAPI 的 Depends。"""
        ...

    @abstractmethod
    def check_direct_instantiation(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查是否直接构造实例。"""
        ...