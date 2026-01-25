"""字段检查接口。"""
from abc import ABC, abstractmethod
import ast


class IFieldChecker(ABC):
    """字段检查接口。"""

    @abstractmethod
    def check_no_optional_fields(self, node: ast.ClassDef, file_path: str):
        """检查字段不能使用 Optional 类型。"""
        pass

    @abstractmethod
    def check_no_default_values(self, node: ast.ClassDef, file_path: str):
        """检查字段不能有默认值。"""
        pass

    @abstractmethod
    def check_field_types(self, node: ast.ClassDef, file_path: str):
        """检查字段类型规范。"""
        pass
