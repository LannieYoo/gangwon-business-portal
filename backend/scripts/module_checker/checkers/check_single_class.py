#!/usr/bin/env python3
"""单文件单类检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
)


class SingleClassChecker(AbstractLayerChecker):
    """单文件单类检查器。"""

    @property
    def name(self) -> str:
        return "单文件单类"

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
        classes = []
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ClassDef):
                classes.append(node.name)

        if len(classes) > 1:
            if not self.is_allowed_multi_class(file_path, classes):
                self.add_violation(
                    file_path, 1,
                    f"文件包含 {len(classes)} 个类 ({', '.join(classes)})，每个文件应只包含一个类",
                )

    def is_allowed_multi_class(self, file_path: str, classes: list) -> bool:
        """检查是否允许多类。"""
        path = Path(file_path)
        name = path.name
        if name.startswith("d_") and all(c.startswith("D") for c in classes):
            return True
        if name.startswith("e_") and all(c.startswith("E") for c in classes):
            return True
        if name.startswith("exc_"):
            return True
        return False

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        pass


if __name__ == "__main__":
    run_checker(SingleClassChecker)
