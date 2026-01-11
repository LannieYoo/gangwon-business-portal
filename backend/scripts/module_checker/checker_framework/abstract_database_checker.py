"""数据库相关检查抽象类。"""
import ast
from typing import Set

from .i_database_checker import IDatabaseChecker


class AbstractDatabaseChecker(IDatabaseChecker):
    """数据库相关检查抽象类。"""

    DB_OPERATION_PATTERNS: Set[str] = {
        'execute', 'commit', 'rollback', 'add', 'delete',
        'merge', 'flush', 'refresh', 'query', 'scalar', 'scalars',
    }

    def check_no_direct_db_operations(self, tree: ast.AST, file_path: str):
        """检查禁止直接数据库操作。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Await):
                if isinstance(node.value, ast.Call):
                    call = node.value
                    if isinstance(call.func, ast.Attribute):
                        if call.func.attr in self.DB_OPERATION_PATTERNS:
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止直接操作数据库 ({call.func.attr})，应通过 Service 层处理",
                            )

    def check_no_direct_db_operations_in_function(self, node: ast.FunctionDef, file_path: str):
        """检查函数内禁止直接数据库操作。"""
        for child in ast.walk(node):
            if isinstance(child, ast.Await):
                if isinstance(child.value, ast.Call):
                    call = child.value
                    if isinstance(call.func, ast.Attribute):
                        if call.func.attr in self.DB_OPERATION_PATTERNS:
                            self.add_violation(
                                file_path, child.lineno,
                                f"函数 {node.name} 禁止直接操作数据库 ({call.func.attr})，应通过 Service 层处理",
                            )

    def check_no_foreign_key(self, node: ast.ClassDef, file_path: str):
        """检查禁止外键。"""
        for item in node.body:
            if isinstance(item, ast.Assign):
                if isinstance(item.value, ast.Call):
                    func_name = self._get_func_name(item.value.func)
                    if func_name == 'Column':
                        for arg in item.value.args:
                            if isinstance(arg, ast.Call):
                                arg_func = self._get_func_name(arg.func)
                                if arg_func == 'ForeignKey':
                                    target_name = item.targets[0].id if item.targets else "unknown"
                                    self.add_violation(
                                        file_path, item.lineno,
                                        f"ORM 字段 {target_name} 禁止使用 ForeignKey",
                                    )

    def check_no_relationship(self, node: ast.ClassDef, file_path: str):
        """检查禁止 relationship。"""
        for item in node.body:
            if isinstance(item, ast.Assign):
                if isinstance(item.value, ast.Call):
                    func_name = self._get_func_name(item.value.func)
                    if func_name == 'relationship':
                        target_name = item.targets[0].id if item.targets else "unknown"
                        self.add_violation(
                            file_path, item.lineno,
                            f"ORM 模型禁止使用 relationship: {target_name}",
                        )

    def check_no_column_default(self, node: ast.ClassDef, file_path: str):
        """检查禁止 Column default=。"""
        for item in node.body:
            if isinstance(item, ast.Assign):
                if isinstance(item.value, ast.Call):
                    func_name = self._get_func_name(item.value.func)
                    if func_name == 'Column':
                        for kw in item.value.keywords:
                            if kw.arg == 'default':
                                target_name = item.targets[0].id if item.targets else "unknown"
                                self.add_violation(
                                    file_path, item.lineno,
                                    f"ORM 字段 {target_name} 禁止使用 default=，应使用 server_default",
                                )

    def check_column_has_comment(self, node: ast.ClassDef, file_path: str):
        """检查 Column 必须有 comment。"""
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        field_name = target.id
                        if field_name.startswith('_') or field_name == '__tablename__':
                            continue
                        if isinstance(item.value, ast.Call):
                            func_name = self._get_func_name(item.value.func)
                            if func_name == 'Column':
                                has_comment = any(kw.arg == 'comment' for kw in item.value.keywords)
                                if not has_comment:
                                    self.add_violation(
                                        file_path, item.lineno,
                                        f"ORM 字段 {field_name} 必须有 comment 描述",
                                    )

    def _get_func_name(self, func: ast.expr) -> str:
        """获取函数名。"""
        if isinstance(func, ast.Name):
            return func.id
        if isinstance(func, ast.Attribute):
            return func.attr
        return ""
