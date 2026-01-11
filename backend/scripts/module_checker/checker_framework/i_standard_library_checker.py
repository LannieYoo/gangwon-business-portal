"""标准库服务检查接口。"""
from abc import ABC, abstractmethod
import ast


class IStandardLibraryChecker(ABC):
    """标准库服务检查接口。"""

    @abstractmethod
    def check_no_direct_standard_library_services(self, tree: ast.AST, file_path: str) -> None:
        """检查禁止直接使用标准库服务，应使用自定义接口。"""
        pass