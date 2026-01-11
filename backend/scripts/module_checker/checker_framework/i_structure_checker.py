"""结构检查接口。"""
from abc import ABC, abstractmethod
from typing import Set
import ast


class IStructureChecker(ABC):
    """结构检查接口。"""

    @abstractmethod
    def check_single_class_per_file(self, tree: ast.AST, file_path: str, class_prefixes: Set[str]):
        """检查单文件单类。"""
        pass

    @abstractmethod
    def check_init_param_count(self, node: ast.ClassDef, file_path: str, max_params: int):
        """检查 __init__ 参数数量。"""
        pass

    @abstractmethod
    def check_no_dict_mapping_attribute(self, node: ast.ClassDef, file_path: str):
        """检查禁止类中定义字典映射属性。"""
        pass
