"""控制流检查抽象类。"""
import ast

from .i_control_flow_checker import IControlFlowChecker


class AbstractControlFlowChecker(IControlFlowChecker):
    """控制流检查抽象类。"""

    def check_no_if_statement(self, tree: ast.AST, file_path: str):
        """检查禁止 if 语句。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.If):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止 if 语句，数据已完整无需条件判断",
                )

    def check_no_match_statement(self, tree: ast.AST, file_path: str):
        """检查禁止 match-case。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Match):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止 match-case，数据已完整无需模式匹配",
                )

    def check_no_ternary_expression(self, tree: ast.AST, file_path: str):
        """检查禁止三元表达式。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.IfExp):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止三元表达式，数据已完整无需条件选择",
                )

    def check_no_comprehension_filter(self, tree: ast.AST, file_path: str):
        """检查禁止推导式 if 过滤。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.ListComp, ast.SetComp, ast.GeneratorExp, ast.DictComp)):
                for generator in node.generators:
                    for if_clause in generator.ifs:
                        self.add_violation(
                            file_path, if_clause.lineno,
                            "禁止推导式 if 过滤，数据已完整无需过滤",
                        )

    def check_no_optional_type(self, tree: ast.AST, file_path: str):
        """检查禁止 Optional 类型。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Subscript):
                if isinstance(node.value, ast.Name) and node.value.id == 'Optional':
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止使用 Optional 类型，所有值必须存在",
                    )

    def check_no_union_none_type(self, tree: ast.AST, file_path: str):
        """检查禁止 | None 类型。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr):
                if self._contains_none_type(node):
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止使用 '| None' 类型，所有值必须存在",
                    )

    def _contains_none_type(self, node: ast.AST) -> bool:
        """检查类型注解是否包含 None。"""
        if isinstance(node, ast.Constant) and node.value is None:
            return True
        if isinstance(node, ast.Name) and node.id == 'None':
            return True
        if isinstance(node, ast.BinOp):
            return self._contains_none_type(node.left) or self._contains_none_type(node.right)
        return False

    # def check_no_for_loop(self, tree: ast.AST, file_path: str):
    #     """检查禁止 for 循环。"""
    #     for node in ast.walk(tree):
    #         if isinstance(node, ast.For):
    #             self.add_violation(
    #                 file_path, node.lineno,
    #                 "禁止 for 循环，业务逻辑应在 Service 层",
    #             )

    # def check_no_while_loop(self, tree: ast.AST, file_path: str):
    #     """检查禁止 while 循环。"""
    #     for node in ast.walk(tree):
    #         if isinstance(node, ast.While):
    #             self.add_violation(
    #                 file_path, node.lineno,
    #                 "禁止 while 循环",
    #             )

    # def check_no_for_loop_in_function(self, node: ast.FunctionDef, file_path: str):
    #     """检查函数内禁止 for 循环。"""
    #     for child in ast.walk(node):
    #         if isinstance(child, ast.For):
    #             self.add_violation(
    #                 file_path, child.lineno,
    #                 f"函数 {node.name} 禁止 for 循环，业务逻辑应在 Service 层",
    #             )

    # def check_no_while_loop_in_function(self, node: ast.FunctionDef, file_path: str):
    #     """检查函数内禁止 while 循环。"""
    #     for child in ast.walk(node):
    #         if isinstance(child, ast.While):
    #             self.add_violation(
    #                 file_path, child.lineno,
    #                 f"函数 {node.name} 禁止 while 循环，业务逻辑应在 Service 层",
    #             )

    def check_no_or_fallback(self, tree: ast.AST, file_path: str):
        """检查禁止 or fallback 模式 (value or default)。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.BoolOp) and isinstance(node.op, ast.Or):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止 or fallback 模式，数据已完整无需备选值",
                )

    def check_no_isinstance(self, tree: ast.AST, file_path: str):
        """检查禁止 isinstance() 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == 'isinstance':
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止 isinstance()，数据结构应统一无需类型检查",
                    )

    def check_no_hasattr(self, tree: ast.AST, file_path: str):
        """检查禁止 hasattr() 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == 'hasattr':
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止 hasattr()，数据已完整无需检查属性存在",
                    )

    def check_no_assert(self, tree: ast.AST, file_path: str):
        """检查禁止 assert 语句。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Assert):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止 assert，数据已完整无需断言检查",
                )

    def check_no_lambda(self, tree: ast.AST, file_path: str):
        """检查禁止 lambda 表达式。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Lambda):
                self.add_violation(
                    file_path, node.lineno,
                    "禁止 lambda，应使用具名方法",
                )

    def check_no_eval_exec(self, tree: ast.AST, file_path: str):
        """检查禁止 eval/exec 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in ('eval', 'exec'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止 {node.func.id}()，动态执行代码不安全",
                    )

    def check_no_star_args(self, tree: ast.AST, file_path: str):
        """检查禁止 *args/**kwargs 参数。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if node.name.startswith('__') and node.name.endswith('__'):
                    continue
                if node.args.vararg:
                    self.add_violation(
                        file_path, node.lineno,
                        f"方法 {node.name} 禁止 *args，参数应明确定义",
                    )
                if node.args.kwarg:
                    self.add_violation(
                        file_path, node.lineno,
                        f"方法 {node.name} 禁止 **kwargs，参数应明确定义",
                    )

    def check_no_setattr_delattr(self, tree: ast.AST, file_path: str):
        """检查禁止 setattr/delattr 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in ('setattr', 'delattr'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止 {node.func.id}()，应直接访问属性",
                    )

    def check_no_globals_locals(self, tree: ast.AST, file_path: str):
        """检查禁止 globals()/locals() 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in ('globals', 'locals'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止 {node.func.id}()，动态作用域访问不安全",
                    )
