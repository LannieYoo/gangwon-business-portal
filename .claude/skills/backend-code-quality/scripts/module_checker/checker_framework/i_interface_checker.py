"""接口实现检查接口。"""
from abc import ABC, abstractmethod
import ast


class IInterfaceChecker(ABC):
    """接口实现检查接口。"""

    @abstractmethod
    def check_implements_interface(self, node: ast.ClassDef, file_path: str):
        """检查是否实现 I 前缀接口。"""
        pass

    @abstractmethod
    def check_inherits_base(self, node: ast.ClassDef, file_path: str, base_name: str):
        """检查是否继承指定基类。"""
        pass
