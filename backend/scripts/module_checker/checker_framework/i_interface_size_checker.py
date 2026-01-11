"""接口大小检查接口。"""
from abc import ABC, abstractmethod
import ast


class IInterfaceSizeChecker(ABC):
    """接口大小检查接口。"""

    @abstractmethod
    def check_interface_method_count(self, node: ast.ClassDef, file_path: str, max_methods: int) -> None:
        """检查接口方法数量不超过限制。"""
        pass
