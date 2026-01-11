"""函数规范检查器接口。"""
import ast
from abc import abstractmethod
from pathlib import Path
from typing import Protocol


class IFunctionsChecker(Protocol):
    """函数规范检查器接口。"""

    @abstractmethod
    def check_standalone_functions(self, tree: ast.AST, file_path: str, path: Path) -> None:
        """检查独立函数。"""
        ...

    @abstractmethod
    def has_route_decorator(self, node: ast.FunctionDef) -> bool:
        """检查是否有路由装饰器。"""
        ...

    @abstractmethod
    def get_decorator_name(self, decorator: ast.expr) -> str:
        """获取装饰器名称。"""
        ...

    @abstractmethod
    def check_private_methods(self, node: ast.ClassDef, file_path: str, path: Path) -> None:
        """检查私有方法。"""
        ...

    @abstractmethod
    def check_static_methods(self, node: ast.ClassDef, file_path: str, path: Path) -> None:
        """检查静态方法。"""
        ...
