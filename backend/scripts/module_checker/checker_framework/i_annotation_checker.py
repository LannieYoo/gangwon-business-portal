"""类型注解检查接口。"""
from abc import ABC, abstractmethod
import ast


class IAnnotationChecker(ABC):
    """类型注解检查接口。"""

    @abstractmethod
    def check_no_quoted_annotations(self, node: ast.ClassDef, file_path: str):
        """检查禁止引号类型注解。"""
        pass

    @abstractmethod
    def check_no_any_type(self, tree: ast.AST, file_path: str):
        """检查禁止 Any 类型。"""
        pass
