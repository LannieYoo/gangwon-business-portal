"""实例化检查接口。"""
import ast
from abc import abstractmethod

from .i_checker import IChecker


class IInstantiationChecker(IChecker):
    """实例化检查接口。"""

    @abstractmethod
    def check_no_direct_instantiation(self, tree: ast.AST, file_path: str):
        """检查禁止方法内直接实例化。"""
        pass
