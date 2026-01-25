#!/usr/bin/env python3
"""Model 规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractModelChecker,
    run_checker,
)


class ModelChecker(
    AbstractLayerChecker,
    AbstractModelChecker,
):
    """Model 规范检查器。"""

    def __init__(self, module_path: str):
        super().__init__(module_path)
        # 初始化 Model 检查器的状态
        self._model_organization_checked = False
        self._model_organization_valid = False

    @property
    def name(self) -> str:
        return "Model 规范"

    @property
    def layer_pattern(self) -> str:
        return "_04_models"

    @property
    def file_prefix(self) -> str:
        return "model_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        # 1. 文件组织检查（只在第一个文件时检查）
        if not hasattr(self, '_checked_organization'):
            self.check_model_file_organization(str(self.module_path))
            self._checked_organization = True
            
            # 如果文件组织有问题，停止后续检查
            if not self._model_organization_valid:
                return
        
        # 2. DTO 和 Model 字段匹配检查（只在第一个文件时检查）
        if not hasattr(self, '_checked_dto_model_matching'):
            self.check_dto_model_field_matching(str(self.module_path))
            self._checked_dto_model_matching = True

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        # 只检查 Model 层的类
        if "_04_models" in file_path:
            self.check_model_structure(node, file_path)


if __name__ == "__main__":
    run_checker(ModelChecker)