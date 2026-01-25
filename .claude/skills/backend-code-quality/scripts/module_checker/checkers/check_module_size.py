#!/usr/bin/env python3
"""模块大小检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractModuleSizeChecker,
    run_checker,
)


class ModuleSizeChecker(
    AbstractLayerChecker,
    AbstractModuleSizeChecker,
):
    """模块大小检查器。"""

    @property
    def name(self) -> str:
        return "模块大小规范"

    @property
    def layer_pattern(self) -> str:
        return "modules"

    @property
    def file_prefix(self) -> str:
