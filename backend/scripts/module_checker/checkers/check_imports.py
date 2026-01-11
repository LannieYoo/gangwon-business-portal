#!/usr/bin/env python3
"""导入规范检查器。

检查项目：
1. 禁止函数内部导入
2. 相对导入路径有效性
3. __init__.py 导出符号有效性
"""
import ast
import sys
from pathlib import Path
from typing import Dict, Set

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
)


class ImportsChecker(AbstractLayerChecker):
    """导入规范检查器。"""

    EXEMPT_FILES = {"deps_", "router_"}

    def __init__(self, module_path: str):
        super().__init__(module_path)
        self.defined_symbols: Dict[Path, Set[str]] = {}

    @property
    def name(self) -> str:
        return "导入规范"

    @property
    def layer_pattern(self) -> str:
        return ""

    @property
    def file_prefix(self) -> str:
        return ""

    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        return True

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        path = Path(file_path)

        if not any(path.name.startswith(prefix) for prefix in self.EXEMPT_FILES):
            self.check_function_internal_imports(tree, file_path)

        if path.name == "__init__.py":
            self.check_init_exports(tree, file_path, path)

        self.check_relative_imports(tree, file_path, path)

    def check_function_internal_imports(self, tree: ast.AST, file_path: str):
        """检查函数内部导入。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for child in node.body:
                    if isinstance(child, (ast.Import, ast.ImportFrom)):
                        self.add_violation(
                            file_path, child.lineno,
                            f"函数 {node.name} 内部禁止导入，所有导入应放在文件顶部",
                        )

    def check_init_exports(self, tree: ast.AST, file_path: str, path: Path):
        """检查 __init__.py 的导出是否有效。"""
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ImportFrom) and node.level > 0:
                self.validate_init_import(path, node, file_path)

    def validate_init_import(self, file_path: Path, node: ast.ImportFrom, file_path_str: str):
        """验证 __init__.py 中的 from ... import ... 语句。"""
        if node.module is None:
            return

        module_parts = node.module.split(".")
        level = node.level

        current_dir = file_path.parent
        for _ in range(level - 1):
            current_dir = current_dir.parent

        target_path = current_dir
        for part in module_parts:
            target_path = target_path / part

        # 查找目标文件
        py_file = None
        if target_path.with_suffix(".py").exists():
            py_file = target_path.with_suffix(".py")
        elif (target_path / "__init__.py").exists():
            py_file = target_path / "__init__.py"

        if py_file is None and not target_path.exists():
            self.add_violation(
                file_path_str, node.lineno,
                f"导入路径不存在: {node.module}",
            )
            return

        if py_file is None:
            return

        available_symbols = self.get_defined_symbols(py_file)
        for alias in node.names:
            if alias.name == "*":
                continue
            if alias.name not in available_symbols:
                self.add_violation(
                    file_path_str, node.lineno,
                    f"符号 '{alias.name}' 在 {py_file.name} 中未定义",
                )

    def check_relative_imports(self, tree: ast.AST, file_path: str, path: Path):
        """检查相对导入路径是否正确。"""
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ImportFrom) and node.level > 0 and node.module:
                self.validate_relative_path(path, node, file_path)

    def validate_relative_path(self, file_path: Path, node: ast.ImportFrom, file_path_str: str):
        """验证相对导入路径。"""
        level = node.level

        abs_file = (self.src_root / file_path_str).resolve()

        current_dir = abs_file.parent

        for _ in range(level - 1):
            current_dir = current_dir.parent

        module_parts = node.module.split(".")
        target_path = current_dir

        for part in module_parts:
            target_path = target_path / part

        exists = (
            target_path.exists() or
            target_path.with_suffix(".py").exists() or
            (target_path / "__init__.py").exists()
        )

        if not exists:
            self.add_violation(
                file_path_str, node.lineno,
                f"相对导入路径无效: {'.' * level}{node.module}",
            )

    def get_defined_symbols(self, file_path: Path) -> Set[str]:
        """获取文件中定义的所有符号。"""
        if file_path in self.defined_symbols:
            return self.defined_symbols[file_path]

        symbols = set()
        try:
            content = file_path.read_text(encoding="utf-8")
            tree = ast.parse(content)
        except (SyntaxError, UnicodeDecodeError):
            return symbols

        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ClassDef):
                symbols.add(node.name)
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                symbols.add(node.name)
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        symbols.add(target.id)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    name = alias.asname if alias.asname else alias.name
                    symbols.add(name)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    name = alias.asname if alias.asname else alias.name.split(".")[0]
                    symbols.add(name)

        self.defined_symbols[file_path] = symbols
        return symbols

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        pass


if __name__ == "__main__":
    run_checker(ImportsChecker)
