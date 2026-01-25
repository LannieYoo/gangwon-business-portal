"""接口方法签名检查器接口。"""
import ast
from abc import ABC, abstractmethod


class IInterfaceSignatureChecker(ABC):
    """接口方法签名检查器接口。"""

    @abstractmethod
    def check_interface_method_signature(self, node: ast.FunctionDef, file_path: str) -> None:
        """检查接口方法签名规范。
        
        规范要求：
        - 无参数方法：method() -> D*Output | None
        - 单参数方法：method(input: D*Input) -> D*Output | None
        - 禁止多参数方法
        """
        pass

    @abstractmethod
    def check_no_param_method_return_type(self, node: ast.FunctionDef, file_path: str) -> None:
        """检查无参数方法的返回类型。
        
        要求返回类型为 D*Output 或 None。
        """
        pass

    @abstractmethod
    def check_single_param_method_signature(self, node: ast.FunctionDef, file_path: str, param: ast.arg) -> None:
        """检查单参数方法的签名。
        
        要求：
        - 参数类型：D*Input
        - 参数名：input
        - 返回类型：D*Output | None
        """
        pass

    @abstractmethod
    def get_type_name(self, annotation: ast.AST) -> str:
        """获取类型注解的名称。"""
        pass

    @abstractmethod
    def get_return_type_name(self, returns: ast.AST) -> str:
        """获取返回类型的名称。"""
        pass