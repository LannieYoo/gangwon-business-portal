"""对齐检查接口。"""
from abc import ABC, abstractmethod
import ast


class IAlignmentChecker(ABC):
    """对齐检查接口。"""

    @abstractmethod
    def check_assignment_alignment(self, node: ast.ClassDef, file_path: str, content: str):
        """检查赋值语句对齐。"""
        pass
