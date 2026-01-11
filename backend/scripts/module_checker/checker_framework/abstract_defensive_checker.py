"""防御性代码检查抽象类。"""
import ast

from .i_defensive_checker import IDefensiveChecker


class AbstractDefensiveChecker(IDefensiveChecker):
    """防御性代码检查抽象类。"""

    def check_no_defensive_return(self, tree: ast.AST, file_path: str):
        """检查禁止防御性默认值返回。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.If):
                if not self._is_early_return(node):
                    continue
                return_node = node.body[0]
                if not isinstance(return_node, ast.Return):
                    continue
                if not self._is_default_value(return_node.value):
                    continue
                violation_type = self._classify_condition(node.test)
                if violation_type:
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止防御性默认值返回 ({violation_type})",
                    )

    def check_no_fallback_logic(self, node: ast.AST, file_path: str, context: str):
        """检查禁止 fallback 逻辑（value or default）。"""
        for child in ast.walk(node):
            if isinstance(child, ast.BoolOp) and isinstance(child.op, ast.Or):
                self.add_violation(file_path, child.lineno, f"{context} 禁止使用 or fallback 模式")

    def check_no_dict_get_fallback(self, tree: ast.AST, file_path: str):
        """检查禁止 dict.get(key, default) fallback 模式。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute) and node.func.attr == 'get':
                    if len(node.args) >= 2:
                        self.add_violation(
                            file_path, node.lineno,
                            "禁止使用 .get(key, default) fallback 模式",
                        )

    def check_no_getattr_fallback(self, tree: ast.AST, file_path: str):
        """检查禁止 getattr(obj, attr, default) fallback 模式。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == 'getattr':
                    if len(node.args) >= 3:
                        self.add_violation(
                            file_path, node.lineno,
                            "禁止使用 getattr(obj, attr, default) fallback 模式",
                        )

    def _is_early_return(self, node: ast.If) -> bool:
        """检查是否是早期返回模式。"""
        return len(node.body) == 1 and isinstance(node.body[0], ast.Return)

    def _is_default_value(self, node) -> bool:
        """检查返回值是否是默认值。"""
        if node is None:
            return True
        if isinstance(node, ast.Constant):
            return node.value in (0, "", [], {}, None, False)
        if isinstance(node, (ast.List, ast.Dict, ast.Tuple, ast.Set)):
            return len(getattr(node, 'elts', [])) == 0 and len(getattr(node, 'keys', [])) == 0
        return False

    def _classify_condition(self, test: ast.expr) -> str:
        """分类条件表达式。"""
        if isinstance(test, ast.Compare):
            if len(test.ops) == 1:
                op = test.ops[0]
                comparator = test.comparators[0]
                if isinstance(op, (ast.LtE, ast.Lt)):
                    if isinstance(comparator, ast.Constant) and comparator.value == 0:
                        return "zero_check"
                if isinstance(op, ast.Is):
                    if isinstance(comparator, ast.Constant) and comparator.value is None:
                        return "none_check"
        if isinstance(test, ast.UnaryOp) and isinstance(test.op, ast.Not):
            return "falsy_check"
        return None
