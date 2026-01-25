"""控制流检查接口。"""
from abc import ABC, abstractmethod
import ast


class IControlFlowChecker(ABC):
    """控制流检查接口。"""

    @abstractmethod
    def check_no_if_statement(self, tree: ast.AST, file_path: str):
        """检查禁止 if 语句。"""
        pass

    @abstractmethod
    def check_no_match_statement(self, tree: ast.AST, file_path: str):
        """检查禁止 match-case。"""
        pass

    @abstractmethod
    def check_no_ternary_expression(self, tree: ast.AST, file_path: str):
        """检查禁止三元表达式。"""
        pass

    @abstractmethod
    def check_no_comprehension_filter(self, tree: ast.AST, file_path: str):
        """检查禁止推导式 if 过滤。"""
        pass

    @abstractmethod
    def check_no_optional_type(self, tree: ast.AST, file_path: str):
        """检查禁止 Optional 类型。"""
        pass

    @abstractmethod
    def check_no_union_none_type(self, tree: ast.AST, file_path: str):
        """检查禁止 | None 类型。"""
        pass

    # @abstractmethod
    # def check_no_for_loop(self, tree: ast.AST, file_path: str):
    #     """检查禁止 for 循环。"""
    #     pass

    # @abstractmethod
    # def check_no_while_loop(self, tree: ast.AST, file_path: str):
    #     """检查禁止 while 循环。"""
    #     pass

    # @abstractmethod
    # def check_no_for_loop_in_function(self, node: ast.FunctionDef, file_path: str):
    #     """检查函数内禁止 for 循环。"""
    #     pass

    # @abstractmethod
    # def check_no_while_loop_in_function(self, node: ast.FunctionDef, file_path: str):
    #     """检查函数内禁止 while 循环。"""
    #     pass

    @abstractmethod
    def check_no_or_fallback(self, tree: ast.AST, file_path: str):
        """检查禁止 or fallback 模式。"""
        pass

    @abstractmethod
    def check_no_isinstance(self, tree: ast.AST, file_path: str):
        """检查禁止 isinstance() 调用。"""
        pass

    @abstractmethod
    def check_no_hasattr(self, tree: ast.AST, file_path: str):
        """检查禁止 hasattr() 调用。"""
        pass

    @abstractmethod
    def check_no_assert(self, tree: ast.AST, file_path: str):
        """检查禁止 assert 语句。"""
        pass

    @abstractmethod
    def check_no_lambda(self, tree: ast.AST, file_path: str):
        """检查禁止 lambda 表达式。"""
        pass

    @abstractmethod
    def check_no_eval_exec(self, tree: ast.AST, file_path: str):
        """检查禁止 eval/exec 调用。"""
        pass

    @abstractmethod
    def check_no_star_args(self, tree: ast.AST, file_path: str):
        """检查禁止 *args/**kwargs 参数。"""
        pass

    @abstractmethod
    def check_no_setattr_delattr(self, tree: ast.AST, file_path: str):
        """检查禁止 setattr/delattr 调用。"""
        pass

    @abstractmethod
    def check_no_globals_locals(self, tree: ast.AST, file_path: str):
        """检查禁止 globals()/locals() 调用。"""
        pass
