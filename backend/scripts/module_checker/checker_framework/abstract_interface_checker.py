"""接口实现检查抽象类。"""
import ast

from .i_interface_checker import IInterfaceChecker
from .ast_helper import AstHelper


class AbstractInterfaceChecker(IInterfaceChecker):
    """接口实现检查抽象类。"""

    def check_implements_interface(self, node: ast.ClassDef, file_path: str):
        """检查是否实现 I 前缀接口。"""
        if not AstHelper.has_interface_base(node):
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 必须实现 I 前缀接口",
            )

    def check_inherits_base(self, node: ast.ClassDef, file_path: str, base_name: str):
        """检查是否继承指定基类。"""
        if not AstHelper.has_base_class(node, base_name):
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 必须继承 {base_name}",
            )
