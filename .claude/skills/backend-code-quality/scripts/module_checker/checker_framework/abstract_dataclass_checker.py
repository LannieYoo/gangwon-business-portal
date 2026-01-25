"""Dataclass 检查器抽象实现。"""
import ast
import os
from pathlib import Path

from .i_dataclass_checker import IDataclassChecker
from .abstract_field_checker import AbstractFieldChecker


class AbstractDataclassChecker(IDataclassChecker, AbstractFieldChecker):
    """Dataclass 检查器抽象实现。"""

    def check_dataclass_file_organization(self, module_path: str) -> None:
        """检查 dataclass 文件组织规范。"""
        if self._organization_checked:
            return
            
        # 查找 _01_contracts 目录
        contracts_dir = None
        module_path_obj = Path(module_path)
        
        if module_path_obj.name == '_01_contracts':
            contracts_dir = module_path_obj
        else:
            for subdir in module_path_obj.rglob('*'):
                if subdir.is_dir() and subdir.name == '_01_contracts':
                    contracts_dir = subdir
                    break
        
        if not contracts_dir:
            self._organization_checked = True
            return
            
        # 检查必需文件
        inputs_file = contracts_dir / 'd_inputs.py'
        outputs_file = contracts_dir / 'd_outputs.py'
        
        organization_issues = 0
        
        if not inputs_file.exists():
            self.add_violation(
                str(contracts_dir), 1,
                "缺少 d_inputs.py 文件，所有输入 dataclass 应集中在此文件中",
            )
            organization_issues += 1
            
        if not outputs_file.exists():
            self.add_violation(
                str(contracts_dir), 1,
                "缺少 d_outputs.py 文件，所有输出 dataclass 应集中在此文件中",
            )
            organization_issues += 1
            
        # 检查不允许的 d_ 文件（只允许 d_inputs.py 和 d_outputs.py）
        allowed_d_files = {'d_inputs.py', 'd_outputs.py'}
        
        for file_path in contracts_dir.glob('d_*.py'):
            if file_path.name not in allowed_d_files:
                if file_path.name == 'd_settings.py':
                    self.add_violation(
                        str(file_path), 1,
                        f"Pydantic Settings 文件 {file_path.name} 应移动到 _04_models/model_settings.py",
                    )
                else:
                    self.add_violation(
                        str(file_path), 1,
                        f"不允许的 d_ 文件 {file_path.name}，数据契约应移动到 d_inputs.py 或 d_outputs.py 中",
                    )
                organization_issues += 1
            
        self._organization_checked = True
        self._organization_valid = (organization_issues == 0)

    def check_dataclass_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 dataclass 结构规范。"""
        # 只检查 D 开头的类
        if not node.name.startswith('D'):
            return
            
        # 严格按照优先级顺序检查，任何一步失败就停止后续检查
        
        # 优先级 1: 基础结构检查 - 必须有 @dataclass
        if not self.check_dataclass_basic_structure(node, file_path):
            return  # 基础结构有问题，停止后续检查
            
        # 优先级 2: frozen 检查 - 必须有 frozen=True
        if not self.check_dataclass_frozen(node, file_path):
            return  # frozen 有问题，停止后续检查
            
        # 优先级 3: 装饰器检查 - 必须有 @auto_factory_methods
        if not self.check_auto_factory_decorator(node, file_path):
            return  # 装饰器有问题，停止后续检查
            
        # 优先级 4: 命名规范检查 - Input/Output 后缀
        if not self.check_dataclass_naming(node, file_path):
            return  # 命名有问题，停止后续检查
            
        # 优先级 5: 工厂方法检查 - 避免手动定义
        self.check_factory_methods_presence(node, file_path)
        
        # 优先级 6: 字段检查 - 类型和默认值
        self.check_field_types(node, file_path)
        self.check_no_default_values(node, file_path)
        self.check_no_optional_fields(node, file_path)

    def check_dataclass_basic_structure(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 基础结构。"""
        has_dataclass = False
        
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id == 'dataclass':
                has_dataclass = True
                break
            elif isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'dataclass':
                    has_dataclass = True
                    break
        
        if not has_dataclass:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 缺少 @dataclass 装饰器",
            )
            return False
            
        return True

    def check_dataclass_frozen(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass frozen 参数。"""
        has_frozen = False
        
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'dataclass':
                    # 检查 frozen=True
                    for keyword in decorator.keywords:
                        if keyword.arg == 'frozen' and isinstance(keyword.value, ast.Constant):
                            if keyword.value.value is True:
                                has_frozen = True
                                break
        
        if not has_frozen:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 应使用 @dataclass(frozen=True) 确保不可变性",
            )
            return False
            
        return True

    def check_auto_factory_decorator(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 @auto_factory_methods 装饰器。"""
        has_auto_factory = False
        
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id == 'auto_factory_methods':
                has_auto_factory = True
                break
        
        if not has_auto_factory:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 缺少 @auto_factory_methods 装饰器",
            )
            return False
            
        return True

    def check_dataclass_decorators(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 装饰器。"""
        has_dataclass = False
        has_auto_factory = False
        has_frozen = False
        
        for decorator in node.decorator_list:
            # 检查 @dataclass
            if isinstance(decorator, ast.Name) and decorator.id == 'dataclass':
                has_dataclass = True
            elif isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'dataclass':
                    has_dataclass = True
                    # 检查 frozen=True
                    for keyword in decorator.keywords:
                        if keyword.arg == 'frozen' and isinstance(keyword.value, ast.Constant):
                            if keyword.value.value is True:
                                has_frozen = True
            
            # 检查 @auto_factory_methods
            if isinstance(decorator, ast.Name) and decorator.id == 'auto_factory_methods':
                has_auto_factory = True
        
        decorator_issues = 0
        
        if not has_frozen:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 应使用 @dataclass(frozen=True) 确保不可变性",
            )
            decorator_issues += 1
            
        if not has_auto_factory:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 缺少 @auto_factory_methods 装饰器",
            )
            decorator_issues += 1
            
        return decorator_issues == 0

    def check_dataclass_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 dataclass 命名规范。"""
        naming_issues = 0
        
        # 检查文件位置和命名后缀
        if 'd_inputs.py' in file_path:
            if not node.name.endswith('Input'):
                self.add_violation(
                    file_path, node.lineno,
                    f"d_inputs.py 中的类 {node.name} 应以 'Input' 结尾",
                )
                naming_issues += 1
        elif 'd_outputs.py' in file_path:
            if not node.name.endswith('Output'):
                self.add_violation(
                    file_path, node.lineno,
                    f"d_outputs.py 中的类 {node.name} 应以 'Output' 结尾",
                )
                naming_issues += 1
        else:
            # 如果不在 inputs/outputs 文件中，检查是否应该移动
            if node.name.endswith('Input'):
                self.add_violation(
                    file_path, node.lineno,
                    f"类 {node.name} 应移动到 d_inputs.py 文件中",
                )
                naming_issues += 1
            elif node.name.endswith('Output'):
                self.add_violation(
                    file_path, node.lineno,
                    f"类 {node.name} 应移动到 d_outputs.py 文件中",
                )
                naming_issues += 1
                
        return naming_issues == 0

    def check_factory_methods_presence(self, node: ast.ClassDef, file_path: str) -> None:
        """检查工厂方法是否存在。"""
        # 由于 @auto_factory_methods 装饰器会自动生成方法，
        # 这里检查是否有手动定义的工厂方法（应该禁止）
        
        prohibited_methods = [
            # 自动生成的工厂方法
            'from_params', 'from_dict', 'from_json', 'to_dict', 'to_json',
            # 常见的手动工厂方法
            'from_type', 'from_config', 'from_settings', 'from_data', 'from_value',
            'from_params', 'from_request', 'from_response', 'from_model',
            'create', 'build', 'make'
        ]
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                # 检查是否是禁止的工厂方法
                if item.name in prohibited_methods:
                    self.add_violation(
                        file_path, item.lineno,
                        f"类 {node.name} 不应手动定义工厂方法 {item.name}，@auto_factory_methods 装饰器会自动生成",
                    )
                # 检查是否是 from_* 或 to_* 模式的方法
                elif item.name.startswith('from_') or item.name.startswith('to_'):
                    self.add_violation(
                        file_path, item.lineno,
                        f"类 {node.name} 不应手动定义工厂方法 {item.name}，@auto_factory_methods 装饰器会自动生成标准工厂方法",
                    )
                # 检查是否是创建类方法
                elif item.name in ['create', 'build', 'make', 'new']:
                    self.add_violation(
                        file_path, item.lineno,
                        f"类 {node.name} 不应手动定义创建方法 {item.name}，使用 @auto_factory_methods 装饰器的 from_params() 方法",
                    )

    def check_dataclass_usage(self, module_path: str) -> bool:
        """检查所有 dataclass 是否被接口使用。"""
        module_path_obj = Path(module_path)
        
        # 查找 _01_contracts 目录
        contracts_dir = None
        if module_path_obj.name == '_01_contracts':
            contracts_dir = module_path_obj
        else:
            for subdir in module_path_obj.rglob('*'):
                if subdir.is_dir() and subdir.name == '_01_contracts':
                    contracts_dir = subdir
                    break
        
        if not contracts_dir:
            return True
            
        # 收集所有 dataclass
        defined_dataclasses = set()
        inputs_file = contracts_dir / 'd_inputs.py'
        outputs_file = contracts_dir / 'd_outputs.py'
        
        for file_path in [inputs_file, outputs_file]:
            if file_path.exists():
                try:
                    content = file_path.read_text(encoding='utf-8')
                    tree = ast.parse(content)
                    for node in ast.walk(tree):
                        if isinstance(node, ast.ClassDef) and node.name.startswith('D'):
                            defined_dataclasses.add(node.name)
                except:
                    continue
        
        # 收集接口中使用的 dataclass
        used_dataclasses = set()
        for interface_file in contracts_dir.glob('i_*.py'):
            try:
                content = interface_file.read_text(encoding='utf-8')
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        # 检查参数类型
                        for arg in node.args.args:
                            if arg.annotation:
                                type_name = self._extract_type_name(arg.annotation)
                                if type_name and type_name.startswith('D'):
                                    used_dataclasses.add(type_name)
                        
                        # 检查返回类型
                        if node.returns:
                            return_type = self._extract_type_name(node.returns)
                            if return_type and return_type.startswith('D'):
                                used_dataclasses.add(return_type)
                            # 处理 Union 类型 (Type | None)
                            elif isinstance(node.returns, ast.BinOp):
                                left_type = self._extract_type_name(node.returns.left)
                                if left_type and left_type.startswith('D'):
                                    used_dataclasses.add(left_type)
            except:
                continue
        
        # 检查未使用的 dataclass
        unused_dataclasses = defined_dataclasses - used_dataclasses
        
        if unused_dataclasses:
            unused_list = ', '.join(sorted(unused_dataclasses))
            self.add_violation(
                str(contracts_dir), 1,
                f"发现未被接口使用的 dataclass: {unused_list}，请删除或在接口中使用",
            )
            return False
            
        return True

    def _extract_type_name(self, annotation) -> str:
        """提取类型注解的名称。"""
        if isinstance(annotation, ast.Name):
            return annotation.id
        elif isinstance(annotation, ast.Attribute):
            return annotation.attr
        elif isinstance(annotation, ast.Subscript):
            return self._extract_type_name(annotation.value)
        elif isinstance(annotation, ast.BinOp) and isinstance(annotation.op, ast.BitOr):
            # 处理 Type | None
            return self._extract_type_name(annotation.left)
        return ""

    def check_dataclass_composition(self, module_path: str) -> bool:
        """检查 dataclass 是否使用组合模式而非重复字段。"""
        module_path_obj = Path(module_path)
        
        # 查找 _01_contracts 目录
        contracts_dir = None
        if module_path_obj.name == '_01_contracts':
            contracts_dir = module_path_obj
        else:
            for subdir in module_path_obj.rglob('*'):
                if subdir.is_dir() and subdir.name == '_01_contracts':
                    contracts_dir = subdir
                    break
        
        if not contracts_dir:
            return True
            
        # 收集所有 dataclass 的字段信息
        dataclass_fields = {}  # {class_name: {field_name: field_type}}
        
        inputs_file = contracts_dir / 'd_inputs.py'
        outputs_file = contracts_dir / 'd_outputs.py'
        
        for file_path in [inputs_file, outputs_file]:
            if file_path.exists():
                try:
                    content = file_path.read_text(encoding='utf-8')
                    tree = ast.parse(content)
                    for node in ast.walk(tree):
                        if isinstance(node, ast.ClassDef) and node.name.startswith('D'):
                            fields = {}
                            for item in node.body:
                                if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                                    field_name = item.target.id
                                    field_type = self._extract_type_name(item.annotation) if item.annotation else "Any"
                                    fields[field_name] = field_type
                            dataclass_fields[node.name] = fields
                except:
                    continue
        
        # 检查字段重复情况
        field_usage = {}  # {(field_name, field_type): [class_names]}
        
        for class_name, fields in dataclass_fields.items():
            for field_name, field_type in fields.items():
                key = (field_name, field_type)
                if key not in field_usage:
                    field_usage[key] = []
                field_usage[key].append(class_name)
        
        # 查找重复字段组合
        repeated_field_groups = {}  # {frozenset(fields): [class_names]}
        
        for class_name, fields in dataclass_fields.items():
            field_set = frozenset(fields.items())
            # 只检查有多个字段的情况
            if len(field_set) >= 2:
                for other_class, other_fields in dataclass_fields.items():
                    if other_class != class_name:
                        other_field_set = frozenset(other_fields.items())
                        # 检查是否有相同的字段组合（至少2个字段）
                        common_fields = field_set & other_field_set
                        if len(common_fields) >= 2:
                            common_key = frozenset(common_fields)
                            if common_key not in repeated_field_groups:
                                repeated_field_groups[common_key] = set()
                            repeated_field_groups[common_key].add(class_name)
                            repeated_field_groups[common_key].add(other_class)
        
        # 报告重复字段组合
        has_violations = False
        for field_group, class_names in repeated_field_groups.items():
            if len(class_names) >= 2:
                field_names = [f"{name}:{type_}" for name, type_ in field_group]
                field_desc = ", ".join(field_names)
                class_list = ", ".join(sorted(class_names))
                
                self.add_violation(
                    str(contracts_dir), 1,
                    f"发现重复字段组合 [{field_desc}] 在类 {class_list} 中，建议提取为独立的 dataclass 并使用组合模式",
                )
                has_violations = True
        
        return not has_violations