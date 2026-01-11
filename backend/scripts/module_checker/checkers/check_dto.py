#!/usr/bin/env python3
"""DTO 规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractDtoChecker,
    run_checker,
)


class DtoChecker(
    AbstractLayerChecker,
    AbstractDtoChecker,
):
    """DTO 规范检查器。"""

    def __init__(self, module_path: str):
        super().__init__(module_path)
        # 初始化 DTO 检查器的状态
        self._dto_organization_checked = False
        self._dto_organization_valid = False

    @property
    def name(self) -> str:
        return "DTO 规范"

    @property
    def layer_pattern(self) -> str:
        return "_02_dtos"

    @property
    def file_prefix(self) -> str:
        return "dto_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        # 1. 文件组织检查（只在第一个文件时检查）
        if not hasattr(self, '_checked_organization'):
            self.check_dto_file_organization(str(self.module_path))
            self._checked_organization = True
            
            # 如果文件组织有问题，停止后续检查
            if not self._dto_organization_valid:
                return

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        # 只检查 DTO 层的类
        if "_02_dtos" in file_path:
            self.check_dto_structure(node, file_path)


if __name__ == "__main__":
    run_checker(DtoChecker)