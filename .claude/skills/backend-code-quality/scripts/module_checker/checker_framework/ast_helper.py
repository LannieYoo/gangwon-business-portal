"""AST 辅助工具。"""
import ast
from typing import List, Tuple


class AstHelper:
    """AST 辅助工具类。"""

    @staticmethod
    def is_dataclass(node: ast.ClassDef) -> bool:
        """判断是否为 dataclass。"""
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id == 'dataclass':
                return True
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'dataclass':
                    return True
        return False

    @staticmethod
    def is_pydantic_model(node: ast.ClassDef) -> bool:
        """判断是否为 Pydantic BaseModel 或 BaseSettings。"""
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id in ('BaseModel', 'BaseSettings'):
                return True
            if isinstance(base, ast.Attribute) and base.attr in ('BaseModel', 'BaseSettings'):
                return True
        return False

    @staticmethod
    def has_interface_base(node: ast.ClassDef) -> bool:
        """判断是否继承 I 前缀接口。"""
        for base in node.bases:
            base_name = ast.unparse(base)
            if base_name.startswith('I') and len(base_name) > 1 and base_name[1].isupper():
                return True
        return False

    @staticmethod
    def has_base_class(node: ast.ClassDef, base_name: str) -> bool:
        """判断是否继承指定基类。"""
        for base in node.bases:
            name = ast.unparse(base)
            if base_name in name:
                return True
        return False

    @staticmethod
    def get_annotation_str(annotation) -> str:
        """获取类型注解字符串。"""
        if annotation:
            return ast.unparse(annotation)
        return ""

    @staticmethod
    def find_business_logic(node: ast.AST) -> List[Tuple[str, int]]:
        """查找业务逻辑，返回 (类型, 行号) 列表。"""
        issues = []
        for child in ast.walk(node):
            if isinstance(child, ast.For):
                issues.append(("for 循环", child.lineno))
            elif isinstance(child, ast.While):
                issues.append(("while 循环", child.lineno))
            elif isinstance(child, ast.If):
                issues.append(("if 语句", child.lineno))
            elif isinstance(child, ast.IfExp):
                issues.append(("三元表达式", child.lineno))
            elif isinstance(child, ast.BoolOp) and isinstance(child.op, ast.Or):
                issues.append(("or fallback", child.lineno))
        return issues

    @staticmethod
    def has_optional_type(annotation_str: str) -> bool:
        """判断是否为 Optional 类型。"""
        return 'Optional' in annotation_str or '| None' in annotation_str

    @staticmethod
    def is_quoted_annotation(annotation) -> bool:
        """判断是否为引号类型注解。"""
        return isinstance(annotation, ast.Constant) and isinstance(annotation.value, str)

    @staticmethod
    def get_func_name(call_node: ast.Call) -> str:
        """获取函数调用名称。"""
        if isinstance(call_node.func, ast.Name):
            return call_node.func.id
        elif isinstance(call_node.func, ast.Attribute):
            return call_node.func.attr
        return ""

    @staticmethod
    def get_class_methods(node: ast.ClassDef) -> List[ast.FunctionDef]:
        """获取类的所有方法。"""
        methods = []
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                methods.append(item)
        return methods

    @staticmethod
    def get_class_fields(node: ast.ClassDef) -> List[ast.AnnAssign]:
        """获取类的所有字段。"""
        fields = []
        for item in node.body:
            if isinstance(item, ast.AnnAssign):
                fields.append(item)
        return fields

    @staticmethod
    def has_decorator(node: ast.FunctionDef, decorator_names: set) -> bool:
        """判断函数是否有指定装饰器。"""
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Attribute):
                    if decorator.func.attr in decorator_names:
                        return True
            elif isinstance(decorator, ast.Attribute):
                if decorator.attr in decorator_names:
                    return True
        return False
