"""私有方法检查接口。"""
from abc import ABC, abstractmethod
import ast


class IPrivateMethodChecker(ABC):
    """私有方法检查接口。"""

    @abstractmethod
    def check_no_private_methods(self, node: ast.ClassDef, file_path: str):
        """检查禁止私有方法。"""
        pass

    @abstractmethod
    def check_helper_function_prefix(self, tree: ast.AST, file_path: str):
        """检查辅助函数必须以 _ 开头。"""
        pass
