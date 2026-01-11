"""Dataclass 检查器接口。"""
import ast
from abc import ABC, abstractmethod


class IDataclassChecker(ABC):
    """Dataclass 检查器接口。"""

    @abstractmethod
    def check_dataclass_file_organization(self, module_path: str) -> None:
        """检查 dataclass 文件组织规范。
        
        要求：
        - 必须有 d_inputs.py 和 d_outputs.py
        - Input/Output 后缀命名
        """
        pass

    @abstractmethod
    def check_dataclass_basic_structure(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 基础结构。
        
        返回 True 如果基础结构正确，False 如果有问题。
        """
        pass

    @abstractmethod
    def check_dataclass_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 dataclass 结构规范。
        
        要求：
        - 使用 @dataclass(frozen=True)
        - 使用 @auto_factory_methods 装饰器
        - 正确的命名后缀
        """
        pass

    @abstractmethod
    def check_dataclass_frozen(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass frozen 参数。
        
        返回 True 如果有 frozen=True，False 如果有问题。
        """
        pass

    @abstractmethod
    def check_auto_factory_decorator(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 @auto_factory_methods 装饰器。
        
        返回 True 如果有装饰器，False 如果有问题。
        """
        pass

    @abstractmethod
    def check_dataclass_decorators(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 装饰器。
        
        返回 True 如果装饰器正确，False 如果有问题。
        """
        pass

    @abstractmethod
    def check_dataclass_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 命名规范。
        
        返回 True 如果命名正确，False 如果有问题。
        """
        pass

    @abstractmethod
    def check_dataclass_composition(self, module_path: str) -> bool:
        """检查 dataclass 是否使用组合模式而非重复字段。
        
        返回 True 如果使用了组合模式，False 如果有重复字段。
        """
        pass

    @abstractmethod
    def check_dataclass_usage(self, module_path: str) -> bool:
        """检查所有 dataclass 是否被接口使用。
        
        返回 True 如果所有 dataclass 都被使用，False 如果有未使用的。
        """
        pass

    @abstractmethod
    def check_factory_methods_presence(self, node: ast.ClassDef, file_path: str) -> None:
        """检查工厂方法是否存在。"""
        pass