"""业务逻辑检查接口。"""
from abc import ABC, abstractmethod
import ast


class IBusinessLogicChecker(ABC):
    """业务逻辑检查接口。"""

    @abstractmethod
    def check_no_business_logic(self, node: ast.AST, file_path: str, context: str):
        """检查禁止业务逻辑。"""
        pass

    @abstractmethod
    def check_no_loops(self, node: ast.AST, file_path: str, context: str):
        """检查禁止循环。"""
        pass
