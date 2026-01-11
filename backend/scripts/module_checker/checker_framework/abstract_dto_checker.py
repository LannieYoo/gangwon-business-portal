"""DTO 检查器抽象实现。"""
import ast
from pathlib import Path

from .i_dto_checker import IDtoChecker
from .abstract_field_checker import AbstractFieldChecker


class AbstractDtoChecker(IDtoChecker, AbstractFieldChecker):
    """DTO 检查器抽象实现。"""

    def check_dto_file_organization(self, module_path: str) -> None:
        """检查 DTO 文件组织规范。"""
        if hasattr(self, '_dto_organization_checked') and self._dto_organization_checked:
            return
            
        # 查找 _02_dtos 目录
        dtos_dir = None
        module_path_obj = Path(module_path)
        
        if module_path_obj.name == '_02_dtos':
            dtos_dir = module_path_obj
        else:
            for subdir in module_path_obj.rglob('*'):
                if subdir.is_dir() and subdir.name == '_02_dtos':
                    dtos_dir = subdir
                    break
        
        if not dtos_dir:
            self._dto_organization_checked = True
            return
            
        # 检查只允许 dto_ 文件
        organization_issues = 0
        
        for file_path in dtos_dir.glob('*.py'):
            if file_path.name == '__init__.py':
                continue
                
            if not file_path.name.startswith('dto_'):
                self.add_violation(
                    str(file_path), 1,
                    f"_02_dtos 层只允许 dto_*.py 文件，发现不规范文件: {file_path.name}",
                )
                organization_issues += 1
            
        self._dto_organization_checked = True
        self._dto_organization_valid = (organization_issues == 0)

    def check_dto_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 DTO 结构规范。"""
        # 只在 _02_dtos 层检查
        if '_02_dtos' not in file_path:
            return
            
        # 按优先级顺序检查
        if not self.check_pydantic_basemodel(node, file_path):
            return  # BaseModel 检查失败，停止后续检查
            
        if not self.check_dto_decorator(node, file_path):
            return  # 装饰器检查失败，停止后续检查
            
        self.check_dto_naming(node, file_path)
        self.check_field_types(node, file_path)
        self.check_no_default_values(node, file_path)
        self.check_no_optional_fields(node, file_path)

    def check_pydantic_basemodel(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查是否继承 Pydantic BaseModel。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return True
            
        has_basemodel = False
        
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id == 'BaseModel':
                has_basemodel = True
                break
            elif isinstance(base, ast.Attribute) and base.attr == 'BaseModel':
                has_basemodel = True
                break
        
        if not has_basemodel:
            self.add_violation(
                file_path, node.lineno,
                f"DTO 类 {node.name} 必须继承 Pydantic BaseModel",
            )
            return False
            
        return True

    def check_dto_decorator(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 DTO 装饰器规范。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return True
            
        # 所有 DTO 类都应该使用 @auto_dto_methods 装饰器
        expected_decorators = ['auto_dto_methods']
        
        # 检查是否有期望的装饰器
        has_expected_decorator = False
        
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id in expected_decorators:
                has_expected_decorator = True
                break
            elif isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id in expected_decorators:
                    has_expected_decorator = True
                    break
                elif isinstance(decorator.func, ast.Attribute) and decorator.func.attr in expected_decorators:
                    has_expected_decorator = True
                    break
        
        if not has_expected_decorator:
            self.add_violation(
                file_path, node.lineno,
                f"DTO 类 {node.name} 必须使用 @auto_dto_methods 装饰器",
            )
            return False
            
        return True

    def check_dto_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 DTO 命名规范。"""
        # 豁免 Pydantic Config 类
        if node.name == 'Config':
            return True
            
        valid_suffixes = ['Request', 'Response']
        
        has_valid_suffix = any(node.name.endswith(suffix) for suffix in valid_suffixes)
        
        if not has_valid_suffix:
            self.add_violation(
                file_path, node.lineno,
                f"DTO 类 {node.name} 应以 Request 或 Response 结尾",
            )
            return False
            
        return True
    def _get_annotation_string(self, annotation: ast.AST) -> str:
        """获取类型注解的字符串表示。"""
        if isinstance(annotation, ast.Name):
            return annotation.id
        elif isinstance(annotation, ast.Attribute):
            return annotation.attr
        elif isinstance(annotation, ast.Subscript):
            value = self._get_annotation_string(annotation.value)
            if isinstance(annotation.slice, ast.Name):
                slice_str = annotation.slice.id
            elif isinstance(annotation.slice, ast.Tuple):
                slice_parts = []
                for elt in annotation.slice.elts:
                    slice_parts.append(self._get_annotation_string(elt))
                slice_str = ', '.join(slice_parts)
            else:
                slice_str = self._get_annotation_string(annotation.slice)
            return f"{value}[{slice_str}]"
        elif isinstance(annotation, ast.BinOp) and isinstance(annotation.op, ast.BitOr):
            # 处理 Type | None 语法
            left = self._get_annotation_string(annotation.left)
            right = self._get_annotation_string(annotation.right)
            return f"{left} | {right}"
        else:
            return str(annotation)