"""方法签名检查接口。"""
from abc import ABC, abstractmethod
import ast
from typing import List, Set


class ISignatureChecker(ABC):
    """方法签名检查接口。"""

    @abstractmethod
    def check_param_type_prefix(self, node: ast.FunctionDef, file_path: str, allowed_prefixes: Set[str]):
        """检查方法参数类型前缀。"""
        pass

    @abstractmethod
    def check_return_type_consistency(self, interface_method: ast.FunctionDef, impl_method: ast.FunctionDef, file_path: str):
        """检查返回类型一致性。"""
        pass

    @abstractmethod
    def check_param_count_consistency(self, interface_method: ast.FunctionDef, impl_method: ast.FunctionDef, file_path: str):
        """检查参数数量一致性。"""
        pass

    @abstractmethod
    def check_max_param_count(self, node: ast.FunctionDef, file_path: str, max_count: int, excluded_params: Set[str]):
        """检查参数数量上限。"""
        pass
