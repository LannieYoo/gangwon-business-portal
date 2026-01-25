"""继承检查抽象类。"""
import ast
from typing import Set

from .i_inheritance_checker import IInheritanceChecker


class AbstractInheritanceChecker(IInheritanceChecker):
    """继承检查抽象类。"""

    PRIMITIVE_TYPES: Set[str] = {
        'int', 'str', 'float', 'bool', 'bytes', 'None', 'type',
    }

    def check_implements_interface(self, node: ast.ClassDef, file_path: str, interface_prefix: str):
        """检查类必须实现接口。"""
        has_interface = False
        for base in node.bases:
            base_name = ast.unparse(base)
            if base_name.startswith(interface_prefix) and len(base_name) > len(interface_prefix):
                if base_name[len(interface_prefix)].isupper():
                    has_interface = True
                    break

        if not has_interface:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 必须实现 {interface_prefix} 前缀接口",
            )

    def check_inherits_base(self, node: ast.ClassDef, file_path: str, base_names: Set[str]):
        """检查类必须继承指定基类。"""
        has_base = False
        for base in node.bases:
            base_name = ast.unparse(base)
            if any(name in base_name for name in base_names):
                has_base = True
                break

        if not has_base:
            self.add_violation(
                file_path, node.lineno,
                f"类 {node.name} 必须继承 {'/'.join(base_names)}",
            )

    def check_no_extra_public_methods(self, impl_class: ast.ClassDef, interface_methods: Set[str], file_path: str):
        """检查实现类不能有接口没有的公共方法。"""
        for item in impl_class.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name == '__init__':
                    continue
                if item.name.startswith('_'):
                    continue
                if item.name not in interface_methods:
                    self.add_violation(
                        file_path, item.lineno,
                        f"方法 {item.name} 在接口中不存在，实现类不能有额外公共方法",
                    )

    def check_init_depends_on_interface(self, node: ast.ClassDef, file_path: str):
        """检查 __init__ 参数类型与参数名的匹配性。"""
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == '__init__':
                for arg in item.args.args:
                    if arg.arg == 'self':
                        continue
                    if not arg.annotation:
                        continue

                    annotation_str = ast.unparse(arg.annotation)
                    base_type = annotation_str.split('[')[0].strip()
                    param_name = arg.arg

                    if base_type in self.PRIMITIVE_TYPES:
                        continue
                    
                    # 豁免 Settings 类（Pydantic BaseSettings）
                    if base_type.endswith('Settings') or base_type.endswith('SettingsModel'):
                        continue
                    
                    # 豁免一些常见的第三方类型
                    exempted_types = ['ISupabaseClient', 'Session', 'Engine', 'Connection']
                    if base_type in exempted_types:
                        continue

                    # 检查接口类型的参数名匹配性
                    if base_type.startswith('I') and len(base_type) > 1 and base_type[1].isupper():
                        self._check_interface_param_name_match(param_name, base_type, file_path, item.lineno)
                        continue
                    
                    # 数据契约和枚举类型是允许的
                    if base_type.startswith('D') and len(base_type) > 1 and base_type[1].isupper():
                        continue
                    if base_type.startswith('E') and len(base_type) > 1 and base_type[1].isupper():
                        continue

                    self.add_violation(
                        file_path, item.lineno,
                        f"__init__ 参数 {param_name} 类型 {annotation_str} 不符合规范，应使用 I/D/E 前缀类型",
                    )

    def _check_interface_param_name_match(self, param_name: str, interface_type: str, file_path: str, line_no: int):
        """检查接口类型参数名与类型的匹配性。"""
        # 从接口类型提取核心名称
        # ILogProcessor -> log_processor 或 processor
        # IUserService -> user_service 或 service
        # IConfigManager -> config_manager 或 manager
        
        # 移除 I 前缀
        core_name = interface_type[1:]
        
        # 转换为 snake_case
        import re
        snake_case = re.sub('([A-Z])', r'_\1', core_name).lower().lstrip('_')
        
        # 生成可能的参数名
        possible_names = set()
        
        # 完整的 snake_case 名称
        possible_names.add(snake_case)
        
        # 最后一个单词（如 processor, service, manager）
        words = snake_case.split('_')
        if len(words) > 1:
            possible_names.add(words[-1])
        
        # 去掉常见后缀的版本
        common_suffixes = ['service', 'manager', 'processor', 'handler', 'controller']
        for suffix in common_suffixes:
            if snake_case.endswith('_' + suffix):
                base_name = snake_case[:-len('_' + suffix)]
                if base_name:
                    possible_names.add(base_name)
        
        # 检查参数名是否匹配
        if param_name not in possible_names:
            suggested_names = sorted(possible_names)[:3]  # 取前3个建议
            self.add_violation(
                file_path, line_no,
                f"__init__ 参数名 '{param_name}' 与接口类型 '{interface_type}' 不匹配，建议使用: {', '.join(suggested_names)}",
            )

    def check_implements_all_interface_methods(self, impl_class: ast.ClassDef, file_path: str):
        """检查实现类是否实现了所有接口方法。"""
        # 获取实现类的所有方法
        impl_methods = set()
        for item in impl_class.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name != '__init__' and not item.name.startswith('_'):
                    impl_methods.add(item.name)

        # 获取所有接口
        interfaces = []
        for base in impl_class.bases:
            base_name = ast.unparse(base)
            if base_name.startswith('I') and len(base_name) > 1 and base_name[1].isupper():
                interfaces.append(base_name)

        if not interfaces:
            return

        # 针对 ConfigService 的特定检查
        if impl_class.name == 'ConfigService':
            # IConfigService 的必需方法
            required_methods = {
                'get_app_config', 'get_database_config', 'get_auth_config', 'get_integration_configs'
            }
            # IWebConfigService 的必需方法  
            web_methods = {
                'get_cors_config', 'get_email_config', 'get_file_upload_config', 'get_logging_config'
            }
            
            if 'IConfigService' in interfaces:
                for method in required_methods:
                    if method not in impl_methods:
                        self.add_violation(
                            file_path, impl_class.lineno,
                            f"类 {impl_class.name} 缺少 IConfigService 接口方法 {method} 的实现",
                        )
            
            if 'IWebConfigService' in interfaces:
                for method in web_methods:
                    if method not in impl_methods:
                        self.add_violation(
                            file_path, impl_class.lineno,
                            f"类 {impl_class.name} 缺少 IWebConfigService 接口方法 {method} 的实现",
                        )

    def check_interface_method_signatures(self, impl_class: ast.ClassDef, file_path: str):
        """检查实现类方法签名是否与接口一致。"""
        # 获取实现类的所有方法及其签名
        impl_methods = {}
        for item in impl_class.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name != '__init__' and not item.name.startswith('_'):
                    impl_methods[item.name] = item

        # 获取所有接口
        interfaces = []
        for base in impl_class.bases:
            base_name = ast.unparse(base)
            if base_name.startswith('I') and len(base_name) > 1 and base_name[1].isupper():
                interfaces.append(base_name)

        if not interfaces:
            return

        # 查找接口文件并解析方法签名
        for interface_name in interfaces:
            interface_methods = self._find_interface_methods(interface_name, file_path)
            
            for method_name, interface_method in interface_methods.items():
                if method_name in impl_methods:
                    impl_method = impl_methods[method_name]
                    self._check_method_signature_match(
                        impl_method, interface_method, method_name, 
                        impl_class.name, interface_name, file_path
                    )

    def _find_interface_methods(self, interface_name: str, file_path: str) -> dict:
        """查找接口文件中的方法定义。"""
        from pathlib import Path
        
        # 根据文件路径找到 _01_contracts 目录
        file_path_obj = Path(file_path)
        contracts_dir = None
        
        for parent in file_path_obj.parents:
            contracts_candidate = parent / '_01_contracts'
            if contracts_candidate.exists():
                contracts_dir = contracts_candidate
                break
        
        if not contracts_dir:
            return {}
        
        # 查找接口文件
        interface_methods = {}
        for interface_file in contracts_dir.glob('i_*.py'):
            try:
                with open(interface_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    tree = ast.parse(content)
                    
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef) and node.name == interface_name:
                        for item in node.body:
                            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                                if not item.name.startswith('_'):
                                    interface_methods[item.name] = item
                        break
            except Exception:
                continue
                
        return interface_methods

    def _check_method_signature_match(self, impl_method: ast.FunctionDef, interface_method: ast.FunctionDef, 
                                    method_name: str, class_name: str, interface_name: str, file_path: str):
        """检查实现方法与接口方法的签名是否匹配。"""
        # 检查参数数量
        impl_args = [arg for arg in impl_method.args.args if arg.arg != 'self']
        interface_args = [arg for arg in interface_method.args.args if arg.arg != 'self']
        
        if len(impl_args) != len(interface_args):
            self.add_violation(
                file_path, impl_method.lineno,
                f"方法 {method_name} 参数数量不匹配：实现 {len(impl_args)} 个，接口 {len(interface_args)} 个",
            )
            return
        
        # 检查参数类型和名称
        for i, (impl_arg, interface_arg) in enumerate(zip(impl_args, interface_args)):
            # 检查参数名
            if impl_arg.arg != interface_arg.arg:
                self.add_violation(
                    file_path, impl_method.lineno,
                    f"方法 {method_name} 参数名不匹配：实现用 '{impl_arg.arg}'，接口要求 '{interface_arg.arg}'",
                )
            
            # 检查参数类型
            impl_type = ast.unparse(impl_arg.annotation) if impl_arg.annotation else None
            interface_type = ast.unparse(interface_arg.annotation) if interface_arg.annotation else None
            
            if impl_type != interface_type:
                self.add_violation(
                    file_path, impl_method.lineno,
                    f"方法 {method_name} 参数 '{impl_arg.arg}' 类型不匹配：实现用 '{impl_type}'，接口要求 '{interface_type}'",
                )
        
        # 检查返回类型
        impl_return = ast.unparse(impl_method.returns) if impl_method.returns else None
        interface_return = ast.unparse(interface_method.returns) if interface_method.returns else None
        
        if impl_return != interface_return:
            self.add_violation(
                file_path, impl_method.lineno,
                f"方法 {method_name} 返回类型不匹配：实现用 '{impl_return}'，接口要求 '{interface_return}'",
            )
