"""成员变量检查接口。"""
from abc import ABC, abstractmethod
import ast


class IMemberChecker(ABC):
    """成员变量检查接口。"""

    @abstractmethod
    def check_no_private_members(self, node: ast.ClassDef, file_path: str):
        """检查禁止私有成员变量（_ 前缀）。"""
        pass

    @abstractmethod
    def check_no_class_variables(self, node: ast.ClassDef, file_path: str):
        """检查禁止类变量（非实例变量）。"""
        pass

    @abstractmethod
    def check_no_dict_mapping_members(self, node: ast.ClassDef, file_path: str):
        """检查禁止字典映射成员变量。"""
        pass
