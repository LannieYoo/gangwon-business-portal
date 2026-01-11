#!/usr/bin/env python3
"""函数规范检查器。

检查项目：
1. 禁止独立函数（模块级函数）
2. 禁止私有方法（_ 前缀）
3. 禁止静态方法（@staticmethod）

豁免通过 IExemption 接口定义。
"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
)
from checker_framework.i_exemption import IExemption
from checker_framework.d_exemption_rule import DExemptionRule
from checker_framework.impl_exemption import DefaultExemption


class FunctionsChecker(AbstractLayerChecker):
    """函数规范检查器。"""

    # 路由装饰器
    ROUTE_DECORATORS = {"get", "post", "put", "delete", "patch", "options", "head"}

    def __init__(self, module_path: str):
        super().__init__(module_path)
        # 创建豁免规则
        rule = DExemptionRule(
            file_prefixes={"deps_", "router_", "model_"},
            standalone_functions={"main"},
            exempt_decorators=self.ROUTE_DECORATORS,
            allow_dunder_methods=True,
            static_method_exempt_prefixes={"d_", "dto_"},
        )
        self.exemption: IExemption = DefaultExemption(rule)

    @property
    def name(self) -> str:
        return "函数规范"

    @property
    def layer_pattern(self) -> str:
        return ""

    @property
    def file_prefix(self) -> str:
        return ""

    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        # 豁免文件不检查
        if self.exemption.is_file_exempt(file_path):
            return False
        return True

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        path = Path(file_path)
        self.check_standalone_functions(tree, file_path, path)

    def check_standalone_functions(self, tree: ast.AST, file_path: str, path: Path):
        """检查独立函数。"""
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if self.exemption.is_function_exempt(path, node.name):
                    continue
                if self.has_route_decorator(node):
                    continue
                self.add_violation(
                    file_path, node.lineno,
                    f"禁止独立函数 {node.name}，应定义接口并实现为类方法",
                )

    def has_route_decorator(self, node) -> bool:
        """检查是否有路由装饰器。"""
        for decorator in node.decorator_list:
            decorator_name = self.get_decorator_name(decorator)
            for route in self.ROUTE_DECORATORS:
                if decorator_name.endswith(f".{route}") or decorator_name == route:
                    return True
        return False

    def get_decorator_name(self, decorator) -> str:
        """获取装饰器名称。"""
        if isinstance(decorator, ast.Name):
            return decorator.id
        elif isinstance(decorator, ast.Attribute):
            parts = []
            node = decorator
            while isinstance(node, ast.Attribute):
                parts.append(node.attr)
                node = node.value
            if isinstance(node, ast.Name):
                parts.append(node.id)
            return ".".join(reversed(parts))
        elif isinstance(decorator, ast.Call):
            return self.get_decorator_name(decorator.func)
        return ""

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        path = Path(file_path)
        self.check_private_methods(node, file_path, path)
        self.check_static_methods(node, file_path, path)

    def check_private_methods(self, node: ast.ClassDef, file_path: str, path: Path):
        """检查私有方法。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if self.exemption.is_method_exempt(path, node.name, item.name):
                    continue
                if item.name.startswith("_"):
                    self.add_violation(
                        file_path, item.lineno,
                        f"禁止私有方法 {node.name}.{item.name}，应定义接口或内联到调用方",
                    )

    def check_static_methods(self, node: ast.ClassDef, file_path: str, path: Path):
        """检查静态方法。"""
        # 豁免 d_ 和 dto_ 前缀文件的静态方法
        if self.exemption.is_static_method_exempt(path):
            return
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if self.exemption.is_method_exempt(path, node.name, item.name):
                    continue
                for decorator in item.decorator_list:
                    decorator_name = self.get_decorator_name(decorator)
                    if decorator_name == "staticmethod":
                        self.add_violation(
                            file_path, item.lineno,
                            f"禁止静态方法 {node.name}.{item.name}，应定义接口并实现为实例方法",
                        )


if __name__ == "__main__":
    run_checker(FunctionsChecker)
