#!/usr/bin/env python3
"""Abstract 类规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractInheritanceChecker,
    AbstractSignatureChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractDuplicateChecker,
    AbstractMemberChecker,
    run_checker,
)


class AbstractChecker(
    AbstractLayerChecker,
    AbstractInheritanceChecker,
    AbstractSignatureChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractDuplicateChecker,
    AbstractMemberChecker,
):
    """Abstract 类规范检查器。"""

    @property
    def name(self) -> str:
        return "Abstract 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_03_abstracts"

    @property
    def file_prefix(self) -> str:
        return "abstract_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        self.check_no_any_type(tree, file_path)
        self.check_no_bare_except(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        if not node.name.startswith('Abstract'):
            return

        self.check_implements_interface(node, file_path, 'I')
        self.check_no_quoted_annotations(node, file_path)
        self.check_no_private_members(node, file_path)
        self.check_no_class_variables(node, file_path)
        self.check_no_dict_mapping_members(node, file_path)
        self.check_init_type_prefix(node, file_path, {'I', 'D', 'E'})
        self.check_method_type_prefix(node, file_path, {'D', 'I', 'E'})

    def check_init_type_prefix(self, node: ast.ClassDef, file_path: str, prefixes: set):
        """检查 __init__ 参数必须使用指定前缀类型。"""
        primitives = {'int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'set',
                      'List', 'Dict', 'Tuple', 'Set', 'Optional', 'Union', 'Any', 'None'}
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == '__init__':
                for arg in item.args.args:
                    if arg.arg == 'self':
                        continue
                    if not arg.annotation:
                        self.add_violation(
                            file_path, item.lineno,
                            f"__init__ 参数 {arg.arg} 缺少类型注解",
                        )
                        continue
                    annotation_str = ast.unparse(arg.annotation)
                    base_type = annotation_str.split('[')[0].strip()
                    if base_type in primitives:
                        self.add_violation(
                            file_path, item.lineno,
                            f"__init__ 参数 {arg.arg} 应使用 {'/'.join(prefixes)} 前缀类型，当前: {annotation_str}",
                        )
                        continue
                    valid = any(
                        base_type.startswith(p) and len(base_type) > 1 and base_type[1].isupper()
                        for p in prefixes
                    )
                    if not valid:
                        self.add_violation(
                            file_path, item.lineno,
                            f"__init__ 参数 {arg.arg} 应使用 {'/'.join(prefixes)} 前缀类型，当前: {annotation_str}",
                        )

    def check_method_type_prefix(self, node: ast.ClassDef, file_path: str, prefixes: set):
        """检查方法参数必须使用指定前缀类型。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__'):
                    continue
                self.check_param_type_prefix(item, file_path, prefixes)


if __name__ == "__main__":
    run_checker(AbstractChecker)
