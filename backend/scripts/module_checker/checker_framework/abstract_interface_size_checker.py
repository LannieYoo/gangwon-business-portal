"""接口大小检查抽象类。"""
import ast

from .i_interface_size_checker import IInterfaceSizeChecker


class AbstractInterfaceSizeChecker(IInterfaceSizeChecker):
    """接口大小检查抽象类。"""

    def check_interface_method_count(self, node: ast.ClassDef, file_path: str, max_methods: int) -> None:
        """检查接口方法数量不超过限制。"""
        methods = []
        for item in node.body:
            if not isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            if item.name.startswith('__') and item.name.endswith('__'):
                continue
            methods.append(item.name)

        method_count = len(methods)
        if method_count > max_methods:
            method_preview = ', '.join(methods[:5])
            suffix = '...' if len(methods) > 5 else ''
            self.add_violation(
                file_path, node.lineno,
                f"接口 {node.name} 方法过多 ({method_count} 个)，建议 ≤{max_methods} 个，考虑拆分: {method_preview}{suffix}",
            )
