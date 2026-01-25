"""Repository 类规范检查器接口。"""
import ast
from abc import abstractmethod
from typing import Protocol


class IRepositoryChecker(Protocol):
    """Repository 类规范检查器接口。"""

    @abstractmethod
    def check_repository_interface_implementation(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 是否实现了对应的接口。"""
        ...

    @abstractmethod
    def check_repository_dependency_injection(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 依赖注入规范。"""
        ...

    @abstractmethod
    def check_repository_data_access(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 数据访问逻辑。"""
        ...

    @abstractmethod
    def check_method_data_access_only(self, method: ast.FunctionDef, file_path: str) -> None:
        """检查方法是否只包含数据访问逻辑。"""
        ...