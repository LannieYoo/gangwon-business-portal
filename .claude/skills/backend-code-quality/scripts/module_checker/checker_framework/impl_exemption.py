#!/usr/bin/env python3
"""豁免接口默认实现。"""
from pathlib import Path

from .i_exemption import IExemption
from .d_exemption_rule import DExemptionRule


class DefaultExemption(IExemption):
    """豁免接口默认实现。"""

    def __init__(self, rule: DExemptionRule):
        self._rule = rule

    def is_file_exempt(self, file_path: Path) -> bool:
        """判断文件是否豁免检查。"""
        file_name = file_path.name
        return any(file_name.startswith(prefix) for prefix in self._rule.file_prefixes)

    def is_function_exempt(self, file_path: Path, function_name: str) -> bool:
        """判断函数是否豁免检查。"""
        return function_name in self._rule.standalone_functions

    def is_method_exempt(self, file_path: Path, class_name: str, method_name: str) -> bool:
        """判断方法是否豁免检查。"""
        if self._rule.allow_dunder_methods and method_name.startswith("__") and method_name.endswith("__"):
            return True
        return False

    def is_static_method_exempt(self, file_path: Path) -> bool:
        """判断静态方法是否豁免检查。"""
        file_name = file_path.name
        return any(file_name.startswith(prefix) for prefix in self._rule.static_method_exempt_prefixes)