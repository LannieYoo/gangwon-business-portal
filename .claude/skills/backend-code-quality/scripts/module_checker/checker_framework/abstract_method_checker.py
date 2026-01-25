"""方法检查抽象类。"""
import ast
from typing import Set

from .i_method_checker import IMethodChecker
from .ast_helper import AstHelper


class AbstractMethodChecker(IMethodChecker):
    """方法检查抽象类。"""

    def check_no_private_methods(self, node: ast.ClassDef, file_path: str, class_name: str):
        """检查禁止 _ 前缀内部方法。"""
        for method in AstHelper.get_class_methods(node):
            if method.name.startswith('_') and not method.name.startswith('__'):
                self.add_violation(
                    file_path, method.lineno,
                    f"类 {class_name} 禁止 _ 前缀内部方法: {method.name}",
                )

    def check_method_param_types(self, node: ast.ClassDef, file_path: str, allowed_prefixes: Set[str], allowed_primitives: Set[str]):
        """检查方法参数类型。"""
        for method in AstHelper.get_class_methods(node):
            if method.name.startswith('__'):
                continue

            for arg in method.args.args:
                if arg.arg == 'self':
                    continue
                if arg.annotation:
                    annotation_str = ast.unparse(arg.annotation)
                    base_type = annotation_str.split('[')[0].strip()

                    is_allowed = (
                        base_type in allowed_primitives or
                        any(base_type.startswith(prefix) for prefix in allowed_prefixes)
                    )

                    if not is_allowed:
                        self.add_violation(
                            file_path, method.lineno,
                            f"方法 {method.name} 参数 {arg.arg} 类型不符合规范，当前: {annotation_str}",
                        )
