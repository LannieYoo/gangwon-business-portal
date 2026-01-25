"""字段检查抽象类。"""
import ast

from .i_field_checker import IFieldChecker
from .ast_helper import AstHelper


class AbstractFieldChecker(IFieldChecker):
    """字段检查抽象类。"""

    def check_no_optional_fields(self, node: ast.ClassDef, file_path: str):
        """检查字段不能使用 Optional 类型。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return
            
        for field in AstHelper.get_class_fields(node):
            if field.annotation:
                annotation_str = ast.unparse(field.annotation)
                if AstHelper.has_optional_type(annotation_str):
                    target_name = ast.unparse(field.target) if field.target else "unknown"
                    self.add_violation(
                        file_path, field.lineno,
                        f"字段 {target_name} 禁止使用 Optional 类型，当前: {annotation_str}",
                    )

    def check_no_default_values(self, node: ast.ClassDef, file_path: str):
        """检查字段不能有默认值。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return
            
        for field in AstHelper.get_class_fields(node):
            if not field.value:
                continue

            target_name = ast.unparse(field.target) if field.target else "unknown"

            if isinstance(field.value, ast.Constant) and field.value.value is None:
                self.add_violation(file_path, field.lineno, f"字段 {target_name} 禁止使用 None 默认值")
            elif isinstance(field.value, ast.Call):
                func_name = AstHelper.get_func_name(field.value)
                if func_name in ('Query', 'Field'):
                    self.add_violation(
                        file_path, field.lineno,
                        f"字段 {target_name} 禁止使用 {func_name}() 默认值",
                    )
            elif isinstance(field.value, ast.Constant):
                value_str = ast.unparse(field.value)
                self.add_violation(file_path, field.lineno, f"字段 {target_name} 禁止使用默认值: {value_str}")
            else:
                # 其他类型的默认值也禁止
                value_str = ast.unparse(field.value)
                self.add_violation(file_path, field.lineno, f"字段 {target_name} 禁止使用默认值: {value_str}")

    def check_field_types(self, node: ast.ClassDef, file_path: str):
        """检查字段类型规范。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return
            
        # 基础的字段类型检查，检查编码规范禁止的类型
        for field in AstHelper.get_class_fields(node):
            if field.annotation:
                annotation_str = ast.unparse(field.annotation)
                target_name = ast.unparse(field.target) if field.target else "unknown"
                
                # 检查是否使用了编码规范禁止的类型
                forbidden_patterns = [
                    'Any',      # 编码规范明确禁止
                    'object',   # 太泛化，没有具体类型信息
                    'type',     # 元类型，不适合字段
                    'typing.Any',  # 完整路径的 Any
                ]
                
                # 检查泛化的容器类型（没有具体元素类型）
                generic_containers = [
                    'list',     # 应使用 list[T]
                    'dict',     # 应使用 dict[K, V]  
                    'set',      # 应使用 set[T]
                    'tuple',    # 应使用 tuple[T, ...]
                ]
                
                # 检查泛化的数据契约类型
                generic_data_contracts = [
                    'DBool',    # 太泛化，应使用具体的布尔字段
                    'DInt',     # 太泛化，应使用具体的整数字段
                    'DString',  # 太泛化，应使用具体的字符串字段
                    'DFloat',   # 太泛化，应使用具体的浮点字段
                    'DDict',    # 太泛化，应使用具体的字典字段
                    'DList',    # 太泛化，应使用具体的列表字段
                ]
                
                for pattern in forbidden_patterns:
                    if pattern in annotation_str:
                        self.add_violation(
                            file_path, field.lineno,
                            f"字段 {target_name} 不能使用 {pattern} 类型，应使用具体的类型注解",
                        )
                        break
                
                # 检查是否使用了泛化的容器类型
                for container in generic_containers:
                    # 检查是否是纯容器类型（没有泛型参数）
                    if annotation_str == container or annotation_str.startswith(f"{container} "):
                        self.add_violation(
                            file_path, field.lineno,
                            f"字段 {target_name} 不能使用泛化的 {container} 类型，应使用具体的泛型类型如 {container}[T]",
                        )
                        break
