"""继承检查接口。"""
from abc import ABC, abstractmethod
import ast
from typing import Set


class IInheritanceChecker(ABC):
    """继承检查接口。"""

    @abstractmethod
    def check_implements_interface(self, node: ast.ClassDef, file_path: str, interface_prefix: str):
        """检查类必须实现接口。"""
        pass

    @abstractmethod
    def check_inherits_base(self, node: ast.ClassDef, file_path: str, base_names: Set[str]):
        """检查类必须继承指定基类。"""
        pass

    @abstractmethod
    def check_no_extra_public_methods(self, impl_class: ast.ClassDef, interface_methods: Set[str], file_path: str):
        """检查实现类不能有接口没有的公共方法。"""
        pass

    @abstractmethod
    def check_init_depends_on_interface(self, node: ast.ClassDef, file_path: str):
        """检查 __init__ 参数必须依赖接口（I 前缀），不能依赖具体类。"""
        pass

    @abstractmethod
    def check_implements_all_interface_methods(self, impl_class: ast.ClassDef, file_path: str):
        """检查实现类是否实现了所有接口方法。"""
        pass

    @abstractmethod
    def check_interface_method_signatures(self, impl_class: ast.ClassDef, file_path: str):
        """检查实现类方法签名是否与接口一致。"""
        pass
