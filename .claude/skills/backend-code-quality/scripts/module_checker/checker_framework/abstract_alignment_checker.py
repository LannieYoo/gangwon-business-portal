"""对齐检查抽象类。"""
import ast

from .i_alignment_checker import IAlignmentChecker


class AbstractAlignmentChecker(IAlignmentChecker):
    """对齐检查抽象类。"""

    def check_assignment_alignment(self, node: ast.ClassDef, file_path: str, content: str):
        """检查赋值语句对齐。"""
        lines = content.split('\n')
        column_lines = []

        for item in node.body:
            if isinstance(item, ast.Assign):
                if isinstance(item.value, ast.Call):
                    func_name = self._get_func_name(item.value.func)
                    if func_name == 'Column':
                        line_idx = item.lineno - 1
                        if line_idx < len(lines):
                            line = lines[line_idx]
                            eq_pos = line.find('=')
                            if eq_pos > 0:
                                target_name = item.targets[0].id if item.targets else "unknown"
                                column_lines.append((item.lineno, eq_pos, target_name))

        if len(column_lines) < 2:
            return

        eq_positions = [pos for _, pos, _ in column_lines]
        max_pos = max(eq_positions)

        for line_no, eq_pos, field_name in column_lines:
            if eq_pos != max_pos:
                self.add_violation(
                    file_path, line_no,
                    f"ORM 字段 {field_name} 的 = 未对齐，当前位置 {eq_pos}，应为 {max_pos}",
                )

    def _get_func_name(self, func: ast.expr) -> str:
        """获取函数名。"""
        if isinstance(func, ast.Name):
            return func.id
        if isinstance(func, ast.Attribute):
            return func.attr
        return ""
