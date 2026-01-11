"""代码质量检查接口。"""
from abc import ABC, abstractmethod
import ast


class ICodeQualityChecker(ABC):
    """代码质量检查接口。"""

    @abstractmethod
    def check_no_bare_except(self, tree: ast.AST, file_path: str):
        """检查禁止裸 except。"""
        pass

    @abstractmethod
    def check_no_internal_imports(self, tree: ast.AST, file_path: str):
        """检查禁止函数内部导入。"""
        pass

    @abstractmethod
    def check_no_standalone_functions(self, tree: ast.AST, file_path: str):
        """检查禁止独立函数。"""
        pass
