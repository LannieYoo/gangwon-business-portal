"""业务逻辑检查抽象类。"""
import ast

from .i_business_logic_checker import IBusinessLogicChecker
from .ast_helper import AstHelper


class AbstractBusinessLogicChecker(IBusinessLogicChecker):
    """业务逻辑检查抽象类。"""

    def check_no_business_logic(self, node: ast.AST, file_path: str, context: str):
        """检查禁止业务逻辑。"""
        issues = AstHelper.find_business_logic(node)
        for issue_type, line_no in issues:
            self.add_violation(file_path, line_no, f"{context} 禁止包含{issue_type}")

    def check_no_loops(self, node: ast.AST, file_path: str, context: str):
        """检查禁止循环。"""
        for child in ast.walk(node):
            if isinstance(child, ast.For):
                self.add_violation(file_path, child.lineno, f"{context} 禁止包含 for 循环")
            elif isinstance(child, ast.While):
                self.add_violation(file_path, child.lineno, f"{context} 禁止包含 while 循环")
