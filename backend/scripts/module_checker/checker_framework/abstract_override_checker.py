"""Override 装饰器检查抽象类。"""
import ast

from .i_override_checker import IOverrideChecker


class AbstractOverrideChecker(IOverrideChecker):
    """Override 装饰器检查抽象类。"""

    def check_all_methods_have_override(self, node: ast.ClassDef, file_path: str) -> None:
        """检查所有方法都有 @override 装饰器。"""
        for item in node.body:
            if not isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            if item.name.startswith('__') and item.name.endswith('__'):
                continue

            has_override = False
            for decorator in item.decorator_list:
                if isinstance(decorator, ast.Name) and decorator.id == 'override':
                    has_override = True
                    break
                if isinstance(decorator, ast.Attribute) and decorator.attr == 'override':
                    has_override = True
                    break

            if not has_override:
                self.add_violation(
                    file_path, item.lineno,
                    f"方法 {item.name} 必须使用 @override 装饰器",
                )
