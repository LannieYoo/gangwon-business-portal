"""结构检查抽象类。"""
import ast
from typing import Set

from .i_structure_checker import IStructureChecker
from .ast_helper import AstHelper


class AbstractStructureChecker(IStructureChecker):
    """结构检查抽象类。"""

    def check_single_class_per_file(self, tree: ast.AST, file_path: str, class_prefixes: Set[str]):
        """检查单文件单类。"""
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if any(node.name.startswith(prefix) for prefix in class_prefixes):
                    classes.append(node.name)

        if len(classes) > 1:
            self.add_violation(
                file_path, 1,
                f"单文件应只包含一个主类，当前有: {', '.join(classes)}",
            )

    def check_init_param_count(self, node: ast.ClassDef, file_path: str, max_params: int):
        """检查 __init__ 参数数量。"""
        for method in AstHelper.get_class_methods(node):
            if method.name == '__init__':
                params = [arg for arg in method.args.args if arg.arg != 'self']
                if len(params) > max_params:
                    self.add_violation(
                        file_path, method.lineno,
                        f"类 {node.name} 的 __init__ 参数超过 {max_params} 个 (当前 {len(params)} 个)，应使用 dataclass 封装",
                    )

    def check_no_dict_mapping_attribute(self, node: ast.ClassDef, file_path: str):
        """检查禁止类中定义字典映射属性。"""
        for method in AstHelper.get_class_methods(node):
            if method.name == '__init__':
                for stmt in method.body:
                    if isinstance(stmt, ast.Assign):
                        for target in stmt.targets:
                            if isinstance(target, ast.Attribute):
                                if target.attr.startswith('_') and isinstance(stmt.value, ast.Dict):
                                    self.add_violation(
                                        file_path, stmt.lineno,
                                        f"禁止类中定义字典映射属性 self.{target.attr}，应使用方法内局部变量",
                                    )
