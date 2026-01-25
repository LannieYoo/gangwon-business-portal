"""常量检查抽象类。"""
import ast

from .i_constant_checker import IConstantChecker


class AbstractConstantChecker(IConstantChecker):
    """常量检查抽象类。"""

    IGNORED_VALUES = {
        "", " ", "\n", "\t", "utf-8", "utf8", "r", "w", "rb", "wb", "a",
        "__name__", "__main__", "__init__", "__all__",
        "id", "name", "type", "value",
        "GET", "POST", "PUT", "DELETE", "PATCH",
        "true", "false", "null", "none",
    }

    IGNORED_PREFIXES = (
        "select ", "insert ", "update ", "delete ",
        "SELECT ", "INSERT ", "UPDATE ", "DELETE ",
        "http://", "https://", "/api/",
    )

    MIN_LENGTH = 3

    def check_no_hardcoded_constants(self, tree: ast.AST, file_path: str):
        """检查禁止硬编码常量。"""
        for node in ast.walk(tree):
            if not isinstance(node, ast.Constant):
                continue
            if not isinstance(node.value, str):
                continue
            value = node.value
            if len(value) < self.MIN_LENGTH:
                continue
            if value.lower() in self.IGNORED_VALUES:
                continue
            if any(value.startswith(p) for p in self.IGNORED_PREFIXES):
                continue
            if self._is_in_docstring(node, tree):
                continue
            if "{" in value and "}" in value:
                continue
            self.add_violation(
                file_path, node.lineno,
                f"禁止硬编码常量: \"{value[:30]}{'...' if len(value) > 30 else ''}\"",
            )

    def check_no_type_alias(self, tree: ast.AST, file_path: str):
        """检查禁止类型别名。"""
        for node in tree.body:
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        if isinstance(node.value, ast.Subscript):
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止类型别名 {target.id}",
                            )

    def _is_in_docstring(self, node: ast.Constant, tree: ast.Module) -> bool:
        """检查是否在 docstring 中。"""
        for item in ast.walk(tree):
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Module)):
                if item.body and isinstance(item.body[0], ast.Expr):
                    if isinstance(item.body[0].value, ast.Constant):
                        if item.body[0].value is node:
                            return True
        return False
