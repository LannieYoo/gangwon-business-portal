"""检查器基础接口。"""
from abc import ABC, abstractmethod


class IChecker(ABC):
    """检查器基础接口。"""

    @abstractmethod
    def check(self) -> int:
        """运行检查，返回违规数量。"""
        pass

    @abstractmethod
    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录。"""
        pass
