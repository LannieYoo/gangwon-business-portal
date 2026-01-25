"""导出检查器接口。"""
from abc import ABC, abstractmethod
import ast


class IExportsChecker(ABC):
    """导出规范检查器接口。"""

    @abstractmethod
    def check_module_exports(self, tree: ast.AST, file_path: str):
        """检查模块导出规范。"""
        pass

    @abstractmethod
    def check_allowed_exports_only(self, tree: ast.AST, file_path: str):
        """检查只导出允许的类型（接口和服务）。"""
        pass