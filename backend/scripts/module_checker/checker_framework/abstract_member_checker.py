"""成员变量检查抽象类。"""
import ast

from .i_member_checker import IMemberChecker


class AbstractMemberChecker(IMemberChecker):
    """成员变量检查抽象类。"""

    def check_no_private_members(self, node: ast.ClassDef, file_path: str):
        """检查禁止私有成员变量（_ 前缀）。

        包括：
        1. 类级别的 _xxx 变量
        2. __init__ 中的 self._xxx 赋值
        """
        # 1. 检查类级别的 _ 前缀变量
        for item in node.body:
            # 普通赋值: _xxx = ...
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        attr_name = target.id
                        # 允许 dunder
                        if attr_name.startswith("__") and attr_name.endswith("__"):
                            continue
                        # 禁止 _ 前缀
                        if attr_name.startswith("_"):
                            self.add_violation(
                                file_path, item.lineno,
                                f"禁止类级私有变量 {node.name}.{attr_name}，应通过接口注入或使用方法内局部变量",
                            )
            # 带类型注解的赋值: _xxx: Type = ...
            elif isinstance(item, ast.AnnAssign):
                if isinstance(item.target, ast.Name):
                    attr_name = item.target.id
                    # 允许 dunder
                    if attr_name.startswith("__") and attr_name.endswith("__"):
                        continue
                    # 禁止 _ 前缀
                    if attr_name.startswith("_"):
                        self.add_violation(
                            file_path, item.lineno,
                            f"禁止类级私有变量 {node.name}.{attr_name}，应通过接口注入或使用方法内局部变量",
                        )

        # 2. 检查 __init__ 中的 self._ 赋值
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == "__init__":
                for stmt in ast.walk(item):
                    if isinstance(stmt, ast.Assign):
                        for target in stmt.targets:
                            if isinstance(target, ast.Attribute):
                                if isinstance(target.value, ast.Name) and target.value.id == "self":
                                    attr_name = target.attr
                                    # 允许 dunder 属性
                                    if attr_name.startswith("__") and attr_name.endswith("__"):
                                        continue
                                    # 禁止 _ 前缀
                                    if attr_name.startswith("_"):
                                        self.add_violation(
                                            file_path, stmt.lineno,
                                            f"禁止私有实例变量 {node.name}.{attr_name}，应通过接口注入依赖",
                                        )

    def check_no_class_variables(self, node: ast.ClassDef, file_path: str):
        """检查禁止类变量（非实例变量）。

        禁止在类体中定义变量（除了 dunder 和大写常量）。
        """
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        attr_name = target.id
                        # 允许 __tablename__ 等 dunder
                        if attr_name.startswith("__") and attr_name.endswith("__"):
                            continue
                        # 允许 _ 前缀（由 check_no_private_members 检查）
                        if attr_name.startswith("_"):
                            continue
                        # 禁止大写常量（应使用枚举）
                        if attr_name.isupper():
                            self.add_violation(
                                file_path, item.lineno,
                                f"禁止类常量 {node.name}.{attr_name}，应使用枚举定义",
                            )
                            continue
                        self.add_violation(
                            file_path, item.lineno,
                            f"禁止类变量 {node.name}.{attr_name}，应使用枚举或方法内局部变量",
                        )
            elif isinstance(item, ast.AnnAssign):
                if isinstance(item.target, ast.Name):
                    attr_name = item.target.id
                    # 允许 dunder
                    if attr_name.startswith("__") and attr_name.endswith("__"):
                        continue
                    # 允许 _ 前缀（由 check_no_private_members 检查）
                    if attr_name.startswith("_"):
                        continue
                    # 禁止大写常量（应使用枚举）
                    if attr_name.isupper():
                        if item.value is not None:
                            self.add_violation(
                                file_path, item.lineno,
                                f"禁止类常量 {node.name}.{attr_name}，应使用枚举定义",
                            )
                        continue
                    # 如果有值，则是类变量
                    if item.value is not None:
                        self.add_violation(
                            file_path, item.lineno,
                            f"禁止类变量 {node.name}.{attr_name}，应使用枚举或方法内局部变量",
                        )

    def check_no_dict_mapping_members(self, node: ast.ClassDef, file_path: str):
        """检查禁止字典映射成员变量。"""
        # 检查类级别的字典映射
        for item in node.body:
            if isinstance(item, ast.Assign):
                if isinstance(item.value, ast.Dict):
                    for target in item.targets:
                        if isinstance(target, ast.Name):
                            attr_name = target.id
                            if attr_name.endswith("_map") or attr_name.endswith("_mapping"):
                                self.add_violation(
                                    file_path, item.lineno,
                                    f"禁止字典映射类变量 {node.name}.{attr_name}，应使用方法内局部变量",
                                )

        # 检查 __init__ 中的字典映射
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == "__init__":
                for stmt in ast.walk(item):
                    if isinstance(stmt, ast.Assign):
                        for target in stmt.targets:
                            if isinstance(target, ast.Attribute):
                                if isinstance(target.value, ast.Name) and target.value.id == "self":
                                    if isinstance(stmt.value, ast.Dict):
                                        attr_name = target.attr
                                        if attr_name.endswith("_map") or attr_name.endswith("_mapping"):
                                            self.add_violation(
                                                file_path, stmt.lineno,
                                                f"禁止字典映射实例变量 {node.name}.{attr_name}，应使用方法内局部变量",
                                            )
