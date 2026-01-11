"""防御性代码检查接口。"""
from abc import ABC, abstractmethod
import ast


class IDefensiveChecker(ABC):
    """防御性代码检查接口。"""

    @abstractmethod
    def check_no_defensive_return(self, tree: ast.AST, file_path: str):
        """检查禁止防御性默认值返回。"""
        pass

    @abstractmethod
    def check_no_fallback_logic(self, node: ast.AST, file_path: str, context: str):
        """检查禁止 fallback 逻辑（value or default）。"""
        pass
