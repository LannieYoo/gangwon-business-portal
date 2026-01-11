"""常量检查接口。"""
from abc import ABC, abstractmethod
import ast


class IConstantChecker(ABC):
    """常量检查接口。"""

    @abstractmethod
    def check_no_hardcoded_constants(self, tree: ast.AST, file_path: str):
        """检查禁止硬编码常量。"""
        pass

    @abstractmethod
    def check_no_type_alias(self, tree: ast.AST, file_path: str):
        """检查禁止类型别名。"""
        pass
