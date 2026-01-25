"""单文件单类检查器接口。"""
from abc import abstractmethod
from typing import Protocol, List


class ISingleClassChecker(Protocol):
    """单文件单类检查器接口。"""

    @abstractmethod
    def is_allowed_multi_class(self, file_path: str, classes: List[str]) -> bool:
        """检查是否允许多类。"""
        ...
