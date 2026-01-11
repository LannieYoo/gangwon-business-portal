"""数据库相关检查接口。"""
from abc import ABC, abstractmethod
import ast


class IDatabaseChecker(ABC):
    """数据库相关检查接口。"""

    @abstractmethod
    def check_no_direct_db_operations(self, tree: ast.AST, file_path: str):
        """检查禁止直接数据库操作。"""
        pass

    @abstractmethod
    def check_no_direct_db_operations_in_function(self, node: ast.FunctionDef, file_path: str):
        """检查函数内禁止直接数据库操作。"""
        pass

    @abstractmethod
    def check_no_foreign_key(self, node: ast.ClassDef, file_path: str):
        """检查禁止外键。"""
        pass

    @abstractmethod
    def check_no_relationship(self, node: ast.ClassDef, file_path: str):
        """检查禁止 relationship。"""
        pass

    @abstractmethod
    def check_no_column_default(self, node: ast.ClassDef, file_path: str):
        """检查禁止 Column default=。"""
        pass

    @abstractmethod
    def check_column_has_comment(self, node: ast.ClassDef, file_path: str):
        """检查 Column 必须有 comment。"""
        pass
