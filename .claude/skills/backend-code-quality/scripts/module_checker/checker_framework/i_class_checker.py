"""类级检查接口。"""
from abc import ABC, abstractmethod
import ast


class IClassChecker(ABC):
    """类级检查接口。"""

    @abstractmethod
    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        pass
