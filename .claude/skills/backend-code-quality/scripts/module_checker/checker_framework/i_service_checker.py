"""Service 类规范检查器接口。"""
import ast
from abc import abstractmethod
from typing import Protocol


class IServiceChecker(Protocol):
    """Service 类规范检查器接口。"""

    @abstractmethod
    def check_method_signatures(self, node: ast.ClassDef, file_path: str) -> None:
        """检查方法参数必须使用 D 前缀数据契约。"""
        ...
