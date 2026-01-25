"""实例化检查抽象类。"""
import ast

from .i_instantiation_checker import IInstantiationChecker


class AbstractInstantiationChecker(IInstantiationChecker):
    """实例化检查抽象类。"""

    # 允许直接实例化的类型
    ALLOWED_INSTANTIATIONS = {
        # 标准库
        'Path', 'datetime', 'date', 'time', 'timedelta',
        'Decimal', 'UUID',
        # IO
        'StringIO', 'BytesIO',
        # CSV
        'DictWriter', 'DictReader',
        # 数据结构
        'list', 'dict', 'set', 'tuple', 'frozenset',
        # 异常
        'Exception', 'ValueError', 'TypeError', 'KeyError',
        'RuntimeError', 'AttributeError', 'IndexError',
        # 线程
        'Lock', 'RLock', 'Event', 'Thread',
        # 时区
        'ZoneInfo',
    }

    def check_no_direct_instantiation(self, tree: ast.AST, file_path: str):
        """检查禁止方法内直接实例化非数据类。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if node.name == '__init__':
                    continue
                self._check_method_instantiation(node, file_path)

    def _check_method_instantiation(self, method: ast.FunctionDef, file_path: str):
        """检查方法内的实例化。"""
        for node in ast.walk(method):
            if isinstance(node, ast.Call):
                class_name = self._get_call_name(node.func)
                if not class_name:
                    continue
                # 只检查首字母大写的调用（类实例化）
                if not class_name[0].isupper():
                    continue
                if self._is_allowed_instantiation(class_name):
                    continue
                if self._is_data_class(class_name):
                    continue
                self.add_violation(
                    file_path, node.lineno,
                    f"禁止方法内直接实例化 {class_name}，应通过 __init__ 注入依赖",
                )

    def _get_call_name(self, node: ast.AST) -> str:
        """获取调用名称。"""
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            return node.attr
        return ""

    def _is_allowed_instantiation(self, name: str) -> bool:
        """检查是否为允许的实例化。"""
        if name in self.ALLOWED_INSTANTIATIONS:
            return True
        if name.endswith('Error') or name.endswith('Exception'):
            return True
        return False

    def _is_data_class(self, name: str) -> bool:
        """检查是否为数据类（D 前缀）。"""
        if name.startswith('D') and len(name) > 1 and name[1].isupper():
            return True
        if name.startswith('E') and len(name) > 1 and name[1].isupper():
            return True
        return False
