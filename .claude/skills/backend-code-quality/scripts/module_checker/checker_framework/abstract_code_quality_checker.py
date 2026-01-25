"""代码质量检查抽象类。"""
import ast

from .i_code_quality_checker import ICodeQualityChecker


class AbstractCodeQualityChecker(ICodeQualityChecker):
    """代码质量检查抽象类。"""

    def check_no_bare_except(self, tree: ast.AST, file_path: str):
        """检查禁止裸 except。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler):
                if node.type is None:
                    self.add_violation(file_path, node.lineno, "禁止使用裸 except，应捕获具体异常")
                elif isinstance(node.type, ast.Name) and node.type.id == 'Exception':
                    self.add_violation(file_path, node.lineno, "禁止捕获 Exception，应捕获具体异常")

    def check_no_internal_imports(self, tree: ast.AST, file_path: str):
        """检查禁止函数内部导入。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for child in node.body:
                    if isinstance(child, (ast.Import, ast.ImportFrom)):
                        self.add_violation(
                            file_path, child.lineno,
                            "禁止函数内部导入，所有导入应放在文件顶部",
                        )

    def check_no_standalone_functions(self, tree: ast.AST, file_path: str):
        """检查禁止独立函数。"""
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not node.name.startswith('_'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止独立函数 {node.name}，应使用类方法",
                    )
