#!/usr/bin/env python3
"""模块导出规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractExportsChecker,
    run_checker,
)


class ExportsChecker(
    AbstractLayerChecker,
    AbstractExportsChecker,
):
    """模块导出规范检查器。"""

    @property
    def name(self) -> str:
        return "导出规范"

    @property
    def layer_pattern(self) -> str:
        return ""  # 检查所有层

    @property
    def file_prefix(self) -> str:
        return "__init__"

    def scan_files(self):
        """扫描 __init__.py 文件。"""
        files = []
        # 如果是单个文件
        if self.module_path.is_file():
            if self.module_path.name == "__init__.py":
                files.append(self.module_path)
            return files
        # 如果是目录，查找所有 __init__.py 文件
        for py_file in self.module_path.rglob("__init__.py"):
            files.append(py_file)
        return files

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        self.check_module_exports(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        # __init__.py 文件不应该定义类
        pass


if __name__ == "__main__":
    run_checker(ExportsChecker)