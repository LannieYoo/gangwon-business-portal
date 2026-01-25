"""导入检查抽象类。"""
import ast
from pathlib import Path
from typing import List, Set

from .i_import_checker import IImportChecker


class AbstractImportChecker(IImportChecker):
    """导入检查抽象类。"""

    def check_no_forbidden_imports(self, tree: ast.AST, file_path: str, forbidden: List[str], message: str):
        """检查禁止的导入。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module:
                for pkg in forbidden:
                    if node.module.startswith(pkg) or pkg in node.module:
                        self.add_violation(file_path, node.lineno, f"{message}: {node.module}")

    def check_no_layer_imports(self, tree: ast.AST, file_path: str, forbidden_layers: List[str], current_module: str):
        """检查禁止导入其他模块的指定层。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module:
                if 'modules' in node.module and current_module:
                    parts = node.module.split('.')
                    for i, part in enumerate(parts):
                        if part == 'modules' and i + 1 < len(parts):
                            imported_module = parts[i + 1]
                            if imported_module != current_module:
                                for layer in forbidden_layers:
                                    if layer in node.module:
                                        self.add_violation(
                                            file_path, node.lineno,
                                            f"禁止导入其他模块的 {layer}: {node.module}",
                                        )
                            break

    def check_function_internal_imports(self, tree: ast.AST, file_path: str) -> None:
        """检查函数内部导入。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for child in node.body:
                    if isinstance(child, (ast.Import, ast.ImportFrom)):
                        self.add_violation(
                            file_path, child.lineno,
                            f"函数 {node.name} 禁止内部导入，所有导入应放在文件顶部",
                        )

    def check_init_exports(self, tree: ast.AST, file_path: str, path: Path) -> None:
        """检查 __init__.py 的导出是否有效。"""
        pass

    def validate_init_import(self, file_path: Path, node: ast.ImportFrom, file_path_str: str) -> None:
        """验证 __init__.py 中的 from ... import ... 语句。"""
        pass

    def check_relative_imports(self, tree: ast.AST, file_path: str, path: Path) -> None:
        """检查相对导入路径是否正确。"""
        pass

    def validate_relative_path(self, file_path: Path, node: ast.ImportFrom, file_path_str: str) -> None:
        """验证相对导入路径。"""
        pass

    def get_defined_symbols(self, file_path: Path) -> Set[str]:
        """获取文件中定义的所有符号。"""
        return set()
