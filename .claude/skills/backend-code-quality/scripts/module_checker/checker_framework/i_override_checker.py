"""Override 装饰器检查接口。"""
from abc import ABC, abstractmethod
import ast


class IOverrideChecker(ABC):
    """Override 装饰器检查接口。"""

    @abstractmethod
    def check_all_methods_have_override(self, node: ast.ClassDef, file_path: str) -> None:
        """检查所有方法都有 @override 装饰器。"""
        pass
