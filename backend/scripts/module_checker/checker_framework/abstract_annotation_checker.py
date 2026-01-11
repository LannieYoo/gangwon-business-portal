"""类型注解检查抽象类。"""
import ast

from .i_annotation_checker import IAnnotationChecker
from .ast_helper import AstHelper


class AbstractAnnotationChecker(IAnnotationChecker):
    """类型注解检查抽象类。"""

    def check_no_quoted_annotations(self, node: ast.ClassDef, file_path: str):
        """检查禁止引号类型注解。"""
        for field in AstHelper.get_class_fields(node):
            if field.annotation and AstHelper.is_quoted_annotation(field.annotation):
                target_name = ast.unparse(field.target) if field.target else "unknown"
                self.add_violation(
                    file_path, field.lineno,
                    f"字段 {target_name} 禁止使用引号类型注解",
                )

        for method in AstHelper.get_class_methods(node):
            for arg in method.args.args:
                if arg.annotation and AstHelper.is_quoted_annotation(arg.annotation):
                    self.add_violation(
                        file_path, method.lineno,
                        f"方法 {method.name} 参数 {arg.arg} 禁止使用引号类型注解",
                    )

            if method.returns and AstHelper.is_quoted_annotation(method.returns):
                self.add_violation(
                    file_path, method.lineno,
                    f"方法 {method.name} 返回值禁止使用引号类型注解",
                )

    def check_no_any_type(self, tree: ast.AST, file_path: str):
        """检查禁止 Any 类型。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and node.id == 'Any':
                self.add_violation(file_path, node.lineno, "禁止使用 Any 类型")
            elif isinstance(node, ast.Attribute) and node.attr == 'Any':
                self.add_violation(file_path, node.lineno, "禁止使用 Any 类型")
