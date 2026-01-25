"""转换方法检查抽象类。"""
import ast
import re

from .i_conversion_checker import IConversionChecker


class AbstractConversionChecker(IConversionChecker):
    """转换方法检查抽象类。"""

    CONVERSION_PATTERNS = [
        (r'^to_', 'to_*'),
        (r'^from_', 'from_*'),
        (r'_to_', '*_to_*'),
        (r'_from_', '*_from_*'),
        (r'^convert_', 'convert_*'),
        (r'^parse_', 'parse_*'),
        (r'^transform_', 'transform_*'),
        (r'^build_', 'build_*'),
    ]

    def check_no_conversion_methods(self, node: ast.ClassDef, file_path: str):
        """检查禁止转换方法。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for pattern, desc in self.CONVERSION_PATTERNS:
                    if re.search(pattern, item.name):
                        self.add_violation(
                            file_path, item.lineno,
                            f"Service 层禁止转换方法 {item.name}（匹配 {desc}），转换逻辑应放在 DTO 或 dataclass 中",
                        )
                        break
