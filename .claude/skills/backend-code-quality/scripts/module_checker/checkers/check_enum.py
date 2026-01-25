#!/usr/bin/env python3
"""Enum 类规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    run_checker,
)


class EnumChecker(
    AbstractLayerChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
):
    """Enum 类规范检查器。"""

    @property
    def name(self) -> str:
        return "Enum 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_01_contracts"

    @property
    def file_prefix(self) -> str:
        return "e_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        self.check_no_any_type(tree, file_path)
        self.check_no_bare_except(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        if not node.name.startswith('E'):
            return
        if len(node.name) < 2 or not node.name[1].isupper():
            return

        self.check_enum_no_methods(node, file_path)

    def check_enum_no_methods(self, node: ast.ClassDef, file_path: str):
        """检查枚举类禁止自定义方法。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name not in ('__str__', '__repr__'):
                    self.add_violation(
                        file_path, item.lineno,
                        f"枚举类 {node.name} 禁止定义方法 {item.name}，E* 类只能包含枚举成员",
                    )


if __name__ == "__main__":
    run_checker(EnumChecker)
