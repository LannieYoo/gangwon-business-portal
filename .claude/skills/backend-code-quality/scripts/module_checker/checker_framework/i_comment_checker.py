"""注释检查器接口。"""
from abc import ABC, abstractmethod
import ast


class ICommentChecker(ABC):
    """注释规范检查器接口。"""

    @abstractmethod
    def check_docstring_format(self, tree: ast.AST, file_path: str):
        """检查 docstring 格式（一句话说明）。"""
        pass

    @abstractmethod
    def check_no_requirements_reference(self, tree: ast.AST, file_path: str):
        """检查禁止 Requirements 引用。"""
        pass

    @abstractmethod
    def check_no_type_duplication_in_docstring(self, tree: ast.AST, file_path: str):
        """检查禁止在 docstring 中重复类型说明。"""
        pass

    @abstractmethod
    def check_no_grouping_comments(self, tree: ast.AST, file_path: str):
        """检查禁止分组注释。"""
        pass

    @abstractmethod
    def check_inline_comment_necessity(self, tree: ast.AST, file_path: str):
        """检查行内注释是否必要（只解释非显而易见的逻辑）。"""
        pass