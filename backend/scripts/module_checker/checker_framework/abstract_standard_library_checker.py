"""标准库服务检查抽象类。"""
import ast

from .i_standard_library_checker import IStandardLibraryChecker


class AbstractStandardLibraryChecker(IStandardLibraryChecker):
    """标准库服务检查抽象类。"""

    def check_no_direct_standard_library_services(self, tree: ast.AST, file_path: str) -> None:
        """检查禁止直接使用标准库服务，应使用自定义接口。"""
        # 只检查已有自定义接口的服务
        forbidden_calls = {
            # 时间相关 - 已有 IDateTimeFormatter
            'datetime.now': 'IDateTimeFormatter.now()',
            'datetime.utcnow': 'IDateTimeFormatter.now_utc()',
            
            # UUID相关 - 已有 IIdGenerator
            'uuid.uuid4': 'IIdGenerator.generate()',
            'uuid.UUID': 'IIdGenerator.parse()',
        }

        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                call_name = self._get_call_name(node)
                if call_name in forbidden_calls:
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止直接使用 {call_name}，应使用 {forbidden_calls[call_name]}",
                    )

    def _get_call_name(self, node: ast.Call) -> str:
        """获取函数调用的完整名称。"""
        if isinstance(node.func, ast.Attribute):
            if isinstance(node.func.value, ast.Name):
                return f"{node.func.value.id}.{node.func.attr}"
            elif isinstance(node.func.value, ast.Attribute):
                # 处理嵌套属性调用，如 datetime.datetime.now
                base = self._get_attribute_chain(node.func.value)
                return f"{base}.{node.func.attr}"
        elif isinstance(node.func, ast.Name):
            return node.func.id
        return ""

    def _get_attribute_chain(self, node: ast.Attribute) -> str:
        """获取属性链，如 datetime.datetime。"""
        if isinstance(node.value, ast.Name):
            return f"{node.value.id}.{node.attr}"
        elif isinstance(node.value, ast.Attribute):
            return f"{self._get_attribute_chain(node.value)}.{node.attr}"
        return node.attr