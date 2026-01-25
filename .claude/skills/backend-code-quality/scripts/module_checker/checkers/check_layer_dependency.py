#!/usr/bin/env python3
"""层级依赖检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
)


class LayerDependencyChecker(AbstractLayerChecker):
    """层级依赖检查器。"""

    LAYER_ORDER = {
        "_01_contracts": 1,
        "_02_dtos": 2,
        "_03_abstracts": 3,
        "_04_models": 4,
        "_05_impls": 5,
        "_06_services": 6,
        "_07_router": 7,
    }

    ALLOWED_DEPS = {
        "_02_dtos": {"_01_contracts"},
        "_03_abstracts": {"_01_contracts"},
        "_04_models": {"_01_contracts"},
        "_05_impls": {"_01_contracts", "_03_abstracts", "_04_models"},
        "_06_services": {"_01_contracts"},
        "_07_router": {"_01_contracts", "_02_dtos", "_04_models", "_05_impls", "_06_services"},
    }

    @property
    def name(self) -> str:
        return "层级依赖"

    @property
    def layer_pattern(self) -> str:
        return ""

    @property
    def file_prefix(self) -> str:
        return ""

    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        for layer in self.LAYER_ORDER:
            if layer in str(file_path):
                return True
        return False

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        current_layer = self.get_current_layer(file_path)
        if not current_layer:
            return

        allowed = self.ALLOWED_DEPS.get(current_layer, set())

        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom) or not node.module:
                continue

            for target_layer in self.LAYER_ORDER:
                if target_layer not in node.module:
                    continue
                if target_layer == current_layer:
                    continue
                if target_layer not in allowed:
                    self.add_violation(
                        file_path, node.lineno,
                        f"{current_layer} 不应依赖 {target_layer}",
                    )

    def get_current_layer(self, file_path: str) -> str:
        """获取当前文件所在层。"""
        for layer in self.LAYER_ORDER:
            if layer in file_path:
                return layer
        return ""

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        pass


if __name__ == "__main__":
    run_checker(LayerDependencyChecker)
