"""Impl 类规范检查器接口。"""
import ast
from abc import abstractmethod
from typing import Protocol


class IImplChecker(Protocol):
    """Impl 类规范检查器接口。"""

    @abstractmethod
    def check_no_constant_class_imports(self, tree: ast.AST, file_path: str) -> None:
        """检查禁止导入常量类 (c_*.py)。"""
        ...

    @abstractmethod
    def check_no_module_level_state(self, tree: ast.AST, file_path: str) -> None:
        """检查禁止模块级状态变量。"""
        ...
