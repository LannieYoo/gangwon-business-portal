"""内联转换检查抽象类。"""
import ast

from .i_inline_conversion_checker import IInlineConversionChecker


class AbstractInlineConversionChecker(IInlineConversionChecker):
    """内联转换检查抽象类。"""

    def check_no_inline_dict_literal(self, tree: ast.AST, file_path: str):
        """检查禁止内联字典字面量构建（作为参数传递）。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                for arg in node.args:
                    if isinstance(arg, ast.Dict) and len(arg.keys) > 2:
                        self.add_violation(
                            file_path, arg.lineno,
                            "禁止内联字典字面量，应使用 dataclass 的 from_*/to_* 方法",
                        )
                for keyword in node.keywords:
                    if isinstance(keyword.value, ast.Dict) and len(keyword.value.keys) > 2:
                        self.add_violation(
                            file_path, keyword.value.lineno,
                            "禁止内联字典字面量，应使用 dataclass 的 from_*/to_* 方法",
                        )

    def check_no_isoformat_call(self, tree: ast.AST, file_path: str):
        """检查禁止 .isoformat() 调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute):
                    if node.func.attr == 'isoformat':
                        self.add_violation(
                            file_path, node.lineno,
                            "禁止 .isoformat() 调用，转换逻辑应放在 dataclass 中",
                        )

    def check_no_str_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止 str() 转换调用（排除字符串字面量）。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == 'str':
                    if node.args and not isinstance(node.args[0], ast.Constant):
                        self.add_violation(
                            file_path, node.lineno,
                            "禁止 str() 转换，转换逻辑应放在 dataclass 中",
                        )

    def check_no_list_comprehension_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止列表推导式中的转换调用。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ListComp):
                elt = node.elt
                if isinstance(elt, ast.Call):
                    if isinstance(elt.func, ast.Attribute):
                        method_name = elt.func.attr
                        if method_name.startswith('to_') or method_name.startswith('from_') or '_to_' in method_name:
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止列表推导式中的转换调用 {method_name}，应使用 dataclass 的批量转换方法",
                            )

    def check_no_direct_dto_construction(self, tree: ast.AST, file_path: str):
        """检查禁止直接构造 DTO 返回值。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Return):
                if isinstance(node.value, ast.Call):
                    if isinstance(node.value.func, ast.Name):
                        func_name = node.value.func.id
                        if func_name.startswith('Dto') and node.value.keywords:
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止直接构造 DTO，应使用 {func_name}.from_result() 类方法",
                            )

    def check_no_dict_literal_return(self, tree: ast.AST, file_path: str):
        """检查禁止返回字典字面量。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Return):
                if isinstance(node.value, ast.Dict):
                    self.add_violation(
                        file_path, node.lineno,
                        "禁止返回字典字面量，应使用 DTO 的 from_result() 类方法",
                    )

    def check_no_direct_dataclass_construction(self, tree: ast.AST, file_path: str):
        """检查禁止直接构造数据契约。"""
        # 基础类型可以直接构造
        basic_types = {
            'DString', 'DInt', 'DFloat', 'DBool', 'DBytes', 
            'DList', 'DDict', 'DPath', 'DDatetime', 'DUuid', 'DUuidString',
            'DTraceId', 'DRequestId', 'DSequence'  # 简单包装类型
        }
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                    if (func_name.startswith('D') and len(func_name) > 1 and 
                        func_name[1].isupper() and func_name not in basic_types):
                        if node.keywords or len(node.args) > 1:
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止直接构造数据契约 {func_name}，应使用 {func_name}.from_*() 类方法",
                            )

    def check_no_dict_literal_argument(self, tree: ast.AST, file_path: str):
        """检查禁止字典字面量作为函数参数。"""
        # 收集所有赋值为空字典的变量
        empty_dict_vars = set()
        
        for node in ast.walk(tree):
            # 检查变量赋值为空字典
            if isinstance(node, ast.Assign):
                if isinstance(node.value, ast.Dict) and len(node.value.keys) == 0:
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            empty_dict_vars.add(target.id)
            
            # 检查函数调用中的字典参数
            if isinstance(node, ast.Call):
                # 检查直接的字典字面量参数
                for keyword in node.keywords:
                    if isinstance(keyword.value, ast.Dict):
                        self.add_violation(
                            file_path, node.lineno,
                            f"禁止字典字面量作为参数 {keyword.arg}，应使用数据契约或枚举",
                        )
                    # 检查空字典变量作为参数
                    elif isinstance(keyword.value, ast.Name) and keyword.value.id in empty_dict_vars:
                        self.add_violation(
                            file_path, node.lineno,
                            f"禁止空字典变量作为参数 {keyword.arg}，应使用数据契约或枚举",
                        )

    def check_no_function_internal_imports(self, tree: ast.AST, file_path: str):
        """检查禁止函数内部导入。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for child in node.body:
                    if isinstance(child, (ast.Import, ast.ImportFrom)):
                        self.add_violation(
                            file_path, child.lineno,
                            f"函数 {node.name} 禁止内部导入，所有导入应放在文件顶部",
                        )
