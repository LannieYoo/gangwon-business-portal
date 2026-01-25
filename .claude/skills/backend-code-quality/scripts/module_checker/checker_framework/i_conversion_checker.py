"""转换方法检查接口。"""
from abc import ABC, abstractmethod
import ast


class IConversionChecker(ABC):
    """转换方法检查接口。"""

    @abstractmethod
    def check_no_conversion_methods(self, node: ast.ClassDef, file_path: str):
        """检查禁止转换方法（to_*/from_*）。"""
        pass
