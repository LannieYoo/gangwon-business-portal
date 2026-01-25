"""方法检查接口。"""
from abc import ABC, abstractmethod
import ast
from typing import Set


class IMethodChecker(ABC):
    """方法检查接口。"""

    @abstractmethod
    def check_no_private_methods(self, node: ast.ClassDef, file_path: str, class_name: str):
        """检查禁止 _ 前缀内部方法。"""
        pass

    @abstractmethod
    def check_method_param_types(self, node: ast.ClassDef, file_path: str, allowed_prefixes: Set[str], allowed_primitives: Set[str]):
        """检查方法参数类型。"""
        pass
