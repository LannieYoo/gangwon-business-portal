"""私有方法检查抽象类。"""
import ast
from typing import Set

from .i_private_method_checker import IPrivateMethodChecker


class AbstractPrivateMethodChecker(IPrivateMethodChecker):
    """私有方法检查抽象类。"""

    def check_no_private_methods(self, node: ast.ClassDef, file_path: str):
        """检查禁止私有方法。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('_') and not item.name.startswith('__'):
                    self.add_violation(
                        file_path, item.lineno,
                        f"禁止私有方法 {item.name}，所有方法应在接口中定义",
                    )

    def check_helper_function_prefix(self, tree: ast.AST, file_path: str, route_decorators: Set[str] = None):
        """检查辅助函数必须以 _ 开头。"""
        if route_decorators is None:
            route_decorators = {'get', 'post', 'put', 'delete', 'patch', 'options', 'head'}

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                is_route = self._is_route_function(node, route_decorators)
                if not is_route and not node.name.startswith('_') and not node.name.startswith('get_'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"辅助函数 {node.name} 必须以 _ 开头",
                    )

    def _is_route_function(self, node: ast.FunctionDef, route_decorators: Set[str]) -> bool:
        """判断是否为路由函数。"""
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Attribute):
                    if decorator.func.attr in route_decorators:
                        return True
            elif isinstance(decorator, ast.Attribute):
                if decorator.attr in route_decorators:
                    return True
        return False
