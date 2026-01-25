#!/usr/bin/env python3
"""命名规范检查器 - 检查文件名、类名、方法名、参数名、返回值名规范。"""
import ast
import re
import sys
from pathlib import Path
from typing import Set, Dict, List, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
    AstHelper,
)


class NamingChecker(AbstractLayerChecker):
    """命名规范检查器 - 检查文件名、类名、方法名、参数名、返回值名。"""

    # 文件前缀规范
    NAMING_RULES = {
        "_01_contracts": ["i_", "r_", "s_", "d_", "e_", "t_", "c_", "exc_"],
        "_02_dtos": ["dto_"],
        "_03_abstracts": ["abstract_"],
        "_04_models": ["model_", "repo_"],
        "_05_impls": ["impl_"],
        "_06_services": ["service_"],
        "_07_router": ["router_", "deps_"],
    }

    # 类名前缀规范 (文件前缀 -> 类名前缀)
    CLASS_PREFIX_RULES = {
        "_01_contracts": {
            "i_": "I",           # 接口类以I开头
            "r_": "I",           # Repository接口也以I开头
            "s_": "I",           # Service接口也以I开头
            "d_": "D",           # 数据契约以D开头
            "e_": "E",           # 枚举以E开头
            "t_": "",            # 类型别名无固定前缀
            "c_": "C",           # 常量类以C开头
            "exc_": "",          # 异常类无固定前缀，但有后缀要求
        },
        "_02_dtos": {
            "dto_": "Dto",       # DTO类以Dto开头
        },
        "_03_abstracts": {
            "abstract_": "Abstract",  # 抽象类以Abstract开头
        },
        "_04_models": {
            "model_": "",        # 模型类通常以Model结尾
            "repo_": "",         # Repository类通常以Repository结尾
        },
        "_05_impls": {
            "impl_": "",         # 实现类无固定前缀要求
        },
        "_06_services": {
            "service_": "",      # 服务类通常以Service结尾
        },
        "_07_router": {
            "router_": "",       # 路由文件通常包含router变量
            "deps_": "",         # 依赖注入文件通常包含get_*函数
        },
    }

    # 类名后缀规范
    CLASS_SUFFIX_RULES = {
        "_01_contracts": {
            "exc_": ["Error", "Exception"],  # 异常类必须以Error或Exception结尾
        },
        "_02_dtos": {
            "dto_": [],  # DTO类后缀根据文件名确定，在 _check_dto_suffix 中处理
        },
        "_04_models": {
            "model_": ["Model"],             # 模型类必须以Model结尾
            "repo_": ["Repository"],         # Repository类必须以Repository结尾
        },
        "_06_services": {
            "service_": ["Service", "Facade"],         # 服务类必须以Service或Facade结尾
        },
    }

    # 方法名规范 - 按层级定义允许的方法名模式
    METHOD_NAME_RULES = {
        "_01_contracts": {
            "patterns": [
                r"^[a-z][a-z0-9_]*$",  # 小写字母开头，下划线分隔
            ],
            "forbidden_prefixes": ["_"],  # 禁止私有方法
            "required_patterns": {
                "i_": r"^(get|set|create|update|delete|find|list|count|exists|validate|process|handle|convert|transform|build|parse|format|export|import|clear|flush|close|start|stop|pause|resume|reset|init|destroy|add|remove|insert|batch|async|sync)_",
                "r_": r"^(find|get|create|update|delete|insert|count|exists|batch|async)_",
                "s_": r"^(get|set|create|update|delete|find|list|count|exists|validate|process|handle|clear|flush|close|start|stop|pause|resume|reset|init|destroy|add|remove|insert|batch|async|sync)_",
            }
        },
        "_02_dtos": {
            "patterns": [
                r"^(to_|from_|create|validate|dict|json).*$",  # 转换和验证方法
            ],
            "forbidden_prefixes": ["_"],
        },
        "_03_abstracts": {
            "patterns": [
                r"^[a-z][a-z0-9_]*$",
            ],
            "forbidden_prefixes": ["_"],
        },
        "_04_models": {
            "patterns": [
                r"^[a-z][a-z0-9_]*$",
            ],
            "forbidden_prefixes": ["_"],
        },
        "_05_impls": {
            "patterns": [
                r"^[a-z][a-z0-9_]*$",
            ],
            "forbidden_prefixes": ["_"],
        },
        "_06_services": {
            "patterns": [
                r"^[a-z][a-z0-9_]*$",
            ],
            "forbidden_prefixes": ["_"],
        },
        "_07_router": {
            "patterns": [
                r"^(get_|create_|update_|delete_|list_).*$",  # 依赖注入函数
                r"^[a-z][a-z0-9_]*$",  # 路由处理函数
            ],
            "forbidden_prefixes": ["_"],
        },
    }

    # 参数名规范
    PARAM_NAME_RULES = {
        "_01_contracts": {
            "allowed_names": ["input", "self"],  # 接口方法只允许 input 参数
            "type_prefixes": ["D", "E", "I"],   # 参数类型必须是 D/E/I 前缀
        },
        "_02_dtos": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "dict", "obj", "item"],  # 禁止通用名称
        },
        "_05_impls": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["D", "E", "I"],   # 实现类参数也必须是契约类型
        },
        "_06_services": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["D", "E", "I"],   # 服务类参数必须是契约类型
        },
    }

    # 返回值类型规范
    RETURN_TYPE_RULES = {
        "_01_contracts": {
            "allowed_prefixes": ["D", "E", "I"],  # 接口返回类型必须是契约类型
            "allowed_types": ["None"],            # 或者 None
        },
        "_02_dtos": {
            "allowed_prefixes": ["D", "Dto"],     # DTO 方法返回 D 或 Dto 类型
        },
        "_05_impls": {
            "allowed_prefixes": ["D", "E", "I"],  # 实现类返回契约类型
            "allowed_types": ["None"],
        },
        "_06_services": {
            "allowed_prefixes": ["D", "E"],       # 服务类返回数据契约或枚举
            "allowed_types": ["None"],
        },
    }

    # 变量名规范
    VARIABLE_NAME_RULES = {
        "patterns": [r"^[a-z][a-z0-9_]*$"],      # 小写字母开头
        "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],  # 禁止通用名称
        "max_length": 30,                         # 最大长度
    }

    # 接口功能分类关键词 (基于业界标准)
    INTERFACE_CATEGORIES = {
        "data_access": [
            "Repository", "Writer", "Reader", "Creator", "Deleter", 
            "Persister", "Storage", "Database", "Cache"
        ],
        "business_logic": [
            "Service", "Manager", "Processor", "Handler", "Calculator", 
            "Validator", "Engine", "Controller", "Facade"
        ],
        "data_processing": [
            "Converter", "Transformer", "Formatter", "Filter", "Parser", 
            "Serializer", "Mapper", "Adapter"
        ],
        "configuration": [
            "Config", "Settings", "Properties", "Environment", "Registry", 
            "Resolver", "Provider"
        ],
        "infrastructure": [
            "Startup", "Shutdown", "Monitor", "Scheduler", "Worker", 
            "Queue", "Pool", "Factory"
        ],
        "extensions": [
            "Exporter", "Importer", "Plugin", "Extension", "Utility", 
            "Helper", "Tool"
        ]
    }

    @property
    def name(self) -> str:
        return "文件命名规范"

    @property
    def layer_pattern(self) -> str:
        return ""

    @property
    def file_prefix(self) -> str:
        return ""

    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        # 跳过__init__.py文件
        if file_path.name == "__init__.py":
            return False
        
        for layer in self.NAMING_RULES:
            if layer in str(file_path):
                return True
        return False

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        path = Path(file_path)
        
        # 检查文件前缀
        for layer, prefixes in self.NAMING_RULES.items():
            if layer in file_path:
                if not any(path.name.startswith(p) for p in prefixes):
                    self.add_violation(
                        file_path, 1,
                        f"文件名 {path.name} 不符合 {layer} 层命名规范，期望前缀: {', '.join(prefixes)}",
                    )
                break

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        class_name = node.name
        path = Path(file_path)
        
        # 检查类名规范
        for layer in self.NAMING_RULES:
            if layer in file_path:
                self._check_class_naming(class_name, file_path, layer, path)
                break

    def check_function(self, node: ast.FunctionDef, file_path: str, content: str):
        """检查函数定义（包括方法）。"""
        # 获取当前层级
        layer = self._get_layer_from_path(file_path)
        if not layer:
            return
            
        # 检查方法名
        self._check_method_name(node, file_path, layer)
        
        # 检查参数名和类型
        self._check_method_parameters(node, file_path, layer)
        
        # 检查返回值类型
        self._check_return_type(node, file_path, layer)
        
        # 检查方法内变量名
        self._check_method_variables(node, file_path)
        
        # 检查构造函数参数类型
        if node.name == "__init__":
            self._check_constructor_parameters(node, file_path, layer)

    def _get_layer_from_path(self, file_path: str) -> str:
        """从文件路径获取层级。"""
        for layer in self.NAMING_RULES:
            if layer in file_path:
                return layer
        return ""

    def _check_method_name(self, node: ast.FunctionDef, file_path: str, layer: str):
        """检查方法名规范。"""
        method_name = node.name
        
        # 跳过特殊方法
        if method_name.startswith('__') and method_name.endswith('__'):
            return
            
        if layer not in self.METHOD_NAME_RULES:
            return
            
        rules = self.METHOD_NAME_RULES[layer]
        
        # 检查禁止的前缀
        if "forbidden_prefixes" in rules:
            for prefix in rules["forbidden_prefixes"]:
                if method_name.startswith(prefix):
                    self.add_violation(
                        file_path, node.lineno,
                        f"方法名 {method_name} 不能以 {prefix} 开头，{layer} 层禁止私有方法"
                    )
                    return
        
        # 检查方法名模式
        if "patterns" in rules:
            pattern_matched = False
            for pattern in rules["patterns"]:
                if re.match(pattern, method_name):
                    pattern_matched = True
                    break
            
            if not pattern_matched:
                self.add_violation(
                    file_path, node.lineno,
                    f"方法名 {method_name} 不符合 {layer} 层命名规范，期望模式: {rules['patterns']}"
                )
        
        # 检查特定文件类型的方法名要求
        if "required_patterns" in rules:
            file_prefix = self._get_file_prefix(file_path)
            if file_prefix in rules["required_patterns"]:
                required_pattern = rules["required_patterns"][file_prefix]
                if not re.match(required_pattern, method_name):
                    self.add_violation(
                        file_path, node.lineno,
                        f"方法名 {method_name} 不符合 {file_prefix} 文件的命名规范，应匹配模式: {required_pattern}"
                    )

    def _check_method_parameters(self, node: ast.FunctionDef, file_path: str, layer: str):
        """检查方法参数名和类型。"""
        if layer not in self.PARAM_NAME_RULES:
            return
            
        rules = self.PARAM_NAME_RULES[layer]
        
        for arg in node.args.args:
            if arg.arg == "self":
                continue
                
            param_name = arg.arg
            
            # 检查参数名规范
            if "allowed_names" in rules:
                if param_name not in rules["allowed_names"]:
                    self.add_violation(
                        file_path, node.lineno,
                        f"参数名 {param_name} 不符合 {layer} 层规范，只允许: {rules['allowed_names']}"
                    )
            
            if "patterns" in rules:
                pattern_matched = False
                for pattern in rules["patterns"]:
                    if re.match(pattern, param_name):
                        pattern_matched = True
                        break
                
                if not pattern_matched:
                    self.add_violation(
                        file_path, node.lineno,
                        f"参数名 {param_name} 不符合命名规范，期望模式: {rules['patterns']}"
                    )
            
            if "forbidden_names" in rules:
                if param_name in rules["forbidden_names"]:
                    self.add_violation(
                        file_path, node.lineno,
                        f"参数名 {param_name} 是禁止的通用名称，请使用更具体的名称"
                    )
            
            # 检查参数类型前缀
            if "type_prefixes" in rules and arg.annotation:
                type_name = AstHelper.get_annotation_str(arg.annotation)
                if type_name and not any(type_name.startswith(prefix) for prefix in rules["type_prefixes"]):
                    self.add_violation(
                        file_path, node.lineno,
                        f"参数 {param_name} 的类型 {type_name} 不符合规范，应使用 {rules['type_prefixes']} 前缀的契约类型"
                    )

    def _check_return_type(self, node: ast.FunctionDef, file_path: str, layer: str):
        """检查返回值类型。"""
        if layer not in self.RETURN_TYPE_RULES or not node.returns:
            return
            
        rules = self.RETURN_TYPE_RULES[layer]
        return_type = AstHelper.get_annotation_str(node.returns)
        
        # 处理 Union 类型 (如 D* | None)
        if "|" in return_type:
            types = [t.strip() for t in return_type.split("|")]
            main_type = types[0]
        else:
            main_type = return_type
        
        # 检查允许的类型
        if "allowed_types" in rules and return_type in rules["allowed_types"]:
            return
            
        # 检查允许的前缀
        if "allowed_prefixes" in rules:
            if not any(main_type.startswith(prefix) for prefix in rules["allowed_prefixes"]):
                self.add_violation(
                    file_path, node.lineno,
                    f"方法 {node.name} 的返回类型 {return_type} 不符合 {layer} 层规范，应使用 {rules['allowed_prefixes']} 前缀"
                )

    def _check_method_variables(self, node: ast.FunctionDef, file_path: str):
        """检查方法内变量名。"""
        for child in ast.walk(node):
            if isinstance(child, ast.Assign):
                for target in child.targets:
                    if isinstance(target, ast.Name):
                        var_name = target.id
                        self._validate_variable_name(var_name, file_path, child.lineno)
            elif isinstance(child, ast.AnnAssign) and isinstance(child.target, ast.Name):
                var_name = child.target.id
                self._validate_variable_name(var_name, file_path, child.lineno)

    def _validate_variable_name(self, var_name: str, file_path: str, line_no: int):
        """验证变量名规范。"""
        rules = self.VARIABLE_NAME_RULES
        
        # 检查模式
        pattern_matched = False
        for pattern in rules["patterns"]:
            if re.match(pattern, var_name):
                pattern_matched = True
                break
        
        if not pattern_matched:
            self.add_violation(
                file_path, line_no,
                f"变量名 {var_name} 不符合命名规范，应使用小写字母开头的下划线分隔格式"
            )
        
        # 检查禁止的名称
        if var_name in rules["forbidden_names"]:
            self.add_violation(
                file_path, line_no,
                f"变量名 {var_name} 是禁止的通用名称，请使用更具体的名称"
            )
        
        # 检查长度
        if len(var_name) > rules["max_length"]:
            self.add_violation(
                file_path, line_no,
                f"变量名 {var_name} 过长（{len(var_name)}字符），最大允许 {rules['max_length']} 字符"
            )

    def _get_file_prefix(self, file_path: str) -> str:
        """获取文件前缀。"""
        path = Path(file_path)
        filename = path.name
        
        for layer, prefixes in self.NAMING_RULES.items():
            if layer in file_path:
                for prefix in prefixes:
                    if filename.startswith(prefix):
                        return prefix
        return ""

    def _check_class_naming(self, class_name: str, file_path: str, layer: str, path: Path):
        """检查类名命名规范。"""
        # 豁免 Pydantic 的 Config 类
        if class_name == "Config" and layer == "_02_dtos":
            return
            
        # 获取文件前缀
        file_prefix = None
        for prefix in self.NAMING_RULES[layer]:
            if path.name.startswith(prefix):
                file_prefix = prefix
                break
        
        if not file_prefix:
            return  # 文件前缀不正确，已在文件级检查中报告
        
        # 检查类名前缀
        if layer in self.CLASS_PREFIX_RULES and file_prefix in self.CLASS_PREFIX_RULES[layer]:
            expected_prefix = self.CLASS_PREFIX_RULES[layer][file_prefix]
            if expected_prefix and not class_name.startswith(expected_prefix):
                self.add_violation(
                    file_path, self._get_class_line(class_name, file_path),
                    f"类名 {class_name} 不符合规范，{layer} 层 {file_prefix} 文件中的类应以 {expected_prefix} 开头"
                )
        
        # 检查类名后缀
        if layer in self.CLASS_SUFFIX_RULES and file_prefix in self.CLASS_SUFFIX_RULES[layer]:
            expected_suffixes = self.CLASS_SUFFIX_RULES[layer][file_prefix]
            if expected_suffixes and not any(class_name.endswith(suffix) for suffix in expected_suffixes):
                self.add_violation(
                    file_path, self._get_class_line(class_name, file_path),
                    f"类名 {class_name} 不符合规范，{layer} 层 {file_prefix} 文件中的类应以 {' 或 '.join(expected_suffixes)} 结尾"
                )
        
        # 特殊检查：DTO 类后缀根据文件名确定
        if layer == "_02_dtos" and file_prefix == "dto_":
            self._check_dto_suffix(class_name, file_path, path)
        
        # 特殊检查：接口类的功能分类
        if layer == "_01_contracts" and file_prefix == "i_":
            self._check_interface_category(class_name, file_path, path)

    def _check_interface_category(self, class_name: str, file_path: str, path: Path):
        """检查接口类是否包含功能分类关键词。"""
        # 提取模块名 (如从 i_log_data_flow.py 提取 log)
        filename_parts = path.stem.split('_')
        if len(filename_parts) >= 2:
            module_name = filename_parts[1]  # log, config, user等
            
            # 检查类名是否包含模块名
            if module_name.title() not in class_name:
                self.add_violation(
                    file_path, self._get_class_line(class_name, file_path),
                    f"接口类名 {class_name} 应包含模块名 {module_name.title()}"
                )
            
            # 检查是否包含功能分类关键词
            has_category = False
            for category, keywords in self.INTERFACE_CATEGORIES.items():
                if any(keyword in class_name for keyword in keywords):
                    has_category = True
                    break
            
            if not has_category:
                all_keywords = []
                for keywords in self.INTERFACE_CATEGORIES.values():
                    all_keywords.extend(keywords)
                self.add_violation(
                    file_path, self._get_class_line(class_name, file_path),
                    f"接口类名 {class_name} 应包含功能分类关键词，如: {', '.join(all_keywords[:10])}..."
                )

    def _get_class_line(self, class_name: str, file_path: str) -> int:
        """获取类定义的行号。"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    if f"class {class_name}" in line:
                        return i
        except:
            pass
        return 1


    def _check_dto_suffix(self, class_name: str, file_path: str, path: Path):
        """检查 DTO 类后缀规范。"""
        filename = path.name
        
        # 根据文件名确定期望的后缀
        if filename == "dto_requests.py":
            expected_suffix = "Request"
        elif filename == "dto_responses.py":
            expected_suffix = "Response"
        else:
            # 其他 dto_ 文件，暂不强制后缀
            return
        
        # 检查类名是否以期望的后缀结尾
        if not class_name.endswith(expected_suffix):
            self.add_violation(
                file_path, self._get_class_line(class_name, file_path),
                f"类名 {class_name} 不符合规范，{filename} 文件中的 DTO 类应以 {expected_suffix} 结尾"
            )

    def _check_constructor_parameters(self, node: ast.FunctionDef, file_path: str, layer: str):
        """检查构造函数参数类型规范。"""
        # 只检查实现层和服务层的构造函数
        if layer not in ["_05_impls", "_06_services"]:
            return
            
        for arg in node.args.args:
            if arg.arg == "self":
                continue
                
            param_name = arg.arg
            
            # 检查参数类型注解
            if not arg.annotation:
                continue  # 没有类型注解的参数跳过
                
            type_name = AstHelper.get_annotation_str(arg.annotation)
            
            # 构造函数参数不应该使用接口类型 (I开头)
            if type_name.startswith('I') and not type_name.endswith('Input'):
                self.add_violation(
                    file_path, node.lineno,
                    f"构造函数参数 {param_name} 的类型 {type_name} 不符合规范，应使用数据契约 (D*Input) 而非接口类型"
                )
            
            # 构造函数参数应该使用数据契约类型 (D开头) 或基础类型
            elif not (type_name.startswith('D') or 
                     type_name in ['str', 'int', 'float', 'bool', 'list', 'dict'] or
                     type_name.startswith('Optional[') or
                     '|' in type_name):  # Union types
                # 豁免一些常见的第三方类型
                exempted_types = ['ISupabaseClient', 'Session', 'Engine', 'Connection']
                if type_name not in exempted_types:
                    self.add_violation(
                        file_path, node.lineno,
                        f"构造函数参数 {param_name} 的类型 {type_name} 不符合规范，建议使用数据契约 (D*Input) 封装依赖"
                    )


if __name__ == "__main__":
    run_checker(NamingChecker)
