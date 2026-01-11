"""命名检查抽象实现 - 拆分为多个专门的抽象类。"""
import re
from pathlib import Path
from typing import Dict, List, Set, Any

from .i_naming_checker import (
    IFileNamingChecker,
    IClassNamingChecker,
    IMethodNamingChecker,
    IParameterNamingChecker,
    IReturnTypeNamingChecker,
    IVariableNamingChecker,
    IEnumNamingChecker,
    INamingChecker
)


class AbstractFileNamingChecker(IFileNamingChecker):
    """文件命名检查抽象实现。"""

    # 内部接口类别定义 - 名词形式，表示组件类型
    INTERNAL_INTERFACE_CATEGORIES = [
        "data_flow", "config", "processing", "runtime", "startup", "shutdown",
        "writer", "reader", "creator", "deleter", "converter", "validator",
        "handler", "processor", "manager", "extensions", "formatter", "parser",
        "monitor", "scheduler", "registry", "factory", "builder", "adapter"
    ]

    # 文件前缀规范 + 类别约束
    FILE_NAMING_RULES = {
        "_01_contracts": {
            "prefixes": ["i_", "r_", "s_", "d_", "e_", "exc_"],
            "categories": {
                "i_": "INTERNAL_INTERFACE_CATEGORIES",  # 引用内部接口类别
                "r_": ["repository"],   # Repository接口，必须包含repository
                "s_": ["service"],      # Service接口，必须包含service  
                "d_": ["inputs", "outputs"],  # 只允许inputs和outputs
                "e_": ["模块名"],       # 必须包含模块名
                "exc_": ["error", "exception"],
            }
        },
        "_02_dtos": {
            "prefixes": ["dto_"],
            "categories": {
                "dto_": ["requests", "responses"],  # 只允许requests和responses
            }
        },
        "_03_abstracts": {
            "prefixes": ["abstract_"],
            "categories": {
                "abstract_": "INTERNAL_INTERFACE_CATEGORIES",  # 与内部接口保持一致
            }
        },
        "_04_models": {
            "prefixes": ["model_", "repo_"],
            "categories": {
                "model_": "INTERNAL_INTERFACE_CATEGORIES",  # 与内部接口保持一致
                "repo_": "INTERNAL_INTERFACE_CATEGORIES",   # 与内部接口保持一致
            }
        },
        "_05_impls": {
            "prefixes": ["impl_"],
            "categories": {
                "impl_": "INTERNAL_INTERFACE_CATEGORIES",  # 与内部接口保持一致
            }
        },
        "_06_services": {
            "prefixes": ["service_"],
            "categories": {
                "service_": ["模块名"],  # 服务必须包含模块名
            }
        },
        "_07_router": {
            "prefixes": ["router_", "deps_"],
            "categories": {
                "router_": ["模块名", "api", "endpoints", "routes"],
                "deps_": ["模块名", "dependencies", "injection", "providers"],
            }
        },
    }

    def __init__(self):
        """初始化文件命名检查器。"""
        pass

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现具体的违规处理逻辑。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def get_layer_from_path(self, file_path: str) -> str:
        """从文件路径获取层级。"""
        for layer in self.FILE_NAMING_RULES:
            if layer in file_path:
                return layer
        return ""

    def extract_module_name(self, file_path: str) -> str:
        """从文件路径提取模块名。"""
        # 从路径中提取模块名，如 /logger/_01_contracts/i_log_data_flow.py -> logger
        parts = file_path.split('/')
        for i, part in enumerate(parts):
            if part.startswith('_') and part[1:3].isdigit():  # 找到层级目录
                if i > 0:
                    return parts[i-1]  # 返回上一级目录作为模块名
        return ""

    def check_file_naming(self, file_path: Path, rel_path: str, required_prefix: str):
        """检查文件命名规范 - 检查前缀 + 类别。"""
        # 跳过 __init__.py
        if file_path.name == "__init__.py":
            return
            
        layer = self.get_layer_from_path(str(file_path))
        if not layer:
            self.add_violation(
                str(file_path), 1,
                f"文件 {file_path.name} 不在规定的层级目录中，必须放在 _01 到 _07 层级目录内"
            )
            return

        # 检查文件扩展名
        if file_path.suffix != '.py':
            self.add_violation(
                str(file_path), 1,
                f"文件扩展名必须是 .py，当前为 {file_path.suffix}"
            )
            return

        filename = file_path.name
        
        # 1. 检查前缀
        if layer in self.FILE_NAMING_RULES:
            layer_rules = self.FILE_NAMING_RULES[layer]
            allowed_prefixes = layer_rules["prefixes"]
            
            valid_prefix = None
            for prefix in allowed_prefixes:
                if filename.startswith(prefix):
                    valid_prefix = prefix
                    break
            
            if not valid_prefix:
                self.add_violation(
                    str(file_path), 1,
                    f"文件名 {filename} 不符合 {layer} 层命名规范。只允许前缀: {', '.join(allowed_prefixes)}"
                )
                return
            
            # 2. 检查类别 (前缀后面的部分)
            self._check_file_category(file_path, layer, valid_prefix)

    def _check_file_category(self, file_path: Path, layer: str, file_prefix: str):
        """检查文件名类别部分。"""
        filename = file_path.stem
        category_part = filename[len(file_prefix):]
        
        if not category_part:
            self.add_violation(
                str(file_path), 1,
                f"文件名 {filename} 缺少类别部分，格式应为: {file_prefix}{{类别}}"
            )
            return
        
        # 获取该前缀的类别要求
        layer_rules = self.FILE_NAMING_RULES[layer]
        if file_prefix in layer_rules["categories"]:
            category_rule = layer_rules["categories"][file_prefix]
            
            # 处理引用内部接口类别的情况
            if category_rule == "INTERNAL_INTERFACE_CATEGORIES":
                required_categories = self.INTERNAL_INTERFACE_CATEGORIES
            elif isinstance(category_rule, list):
                required_categories = category_rule
            else:
                return
            
            # 特殊处理：模块名检查
            if "模块名" in required_categories:
                module_name = self.extract_module_name(str(file_path))
                if module_name and module_name not in category_part:
                    self.add_violation(
                        str(file_path), 1,
                        f"文件名 {filename} 应包含模块名 '{module_name}'"
                    )
                return
            
            # 检查是否包含必需的类别词汇
            has_required_category = any(category in category_part for category in required_categories)
            if not has_required_category:
                self.add_violation(
                    str(file_path), 1,
                    f"文件名 {filename} 应包含类别词汇，要求: {', '.join(required_categories[:8])}{'...' if len(required_categories) > 8 else ''}"
                )


class AbstractClassNamingChecker(IClassNamingChecker):
    """类命名检查抽象实现。"""

    # 类名前缀规范
    CLASS_PREFIX_RULES = {
        "_01_contracts": {
            "i_": "I", "r_": "I", "s_": "I", "d_": "D", "e_": "E", "exc_": "",
        },
        "_02_dtos": {"dto_": "Dto"},
        "_03_abstracts": {"abstract_": "Abstract"},
        "_04_models": {"model_": "", "repo_": ""},
        "_05_impls": {"impl_": ""},
        "_06_services": {"service_": ""},
        "_07_router": {"router_": "", "deps_": ""},
    }

    # 类名后缀规范 - 基于文件前缀和功能类别 (名词形式)
    CLASS_SUFFIX_RULES = {
        "_01_contracts": {
            "i_": {
                # 内部接口后缀 - 名词形式，表示组件类型
                "data_flow": ["DataFlow"],
                "config": ["Config"],
                "processing": ["Processing", "Processor"],
                "runtime": ["Runtime"],
                "startup": ["Startup"],
                "shutdown": ["Shutdown"],
                "writer": ["Writer"],
                "reader": ["Reader"],
                "creator": ["Creator"],
                "deleter": ["Deleter"],
                "converter": ["Converter"],
                "validator": ["Validator"],
                "handler": ["Handler"],
                "processor": ["Processor"],
                "manager": ["Manager"],
                "extensions": ["Extensions"],
                "formatter": ["Formatter"],
                "parser": ["Parser"],
                "monitor": ["Monitor"],
                "scheduler": ["Scheduler"],
                "registry": ["Registry"],
                "factory": ["Factory"],
                "builder": ["Builder"],
                "adapter": ["Adapter"],
            },
            "r_": ["Repository"],  # Repository接口必须以Repository结尾
            "s_": ["Service"],     # Service接口必须以Service结尾
            "d_": {
                "inputs": ["Input"],   # 输入数据契约以Input结尾
                "outputs": ["Output"], # 输出数据契约以Output结尾
            },
            "e_": [],              # 枚举无固定后缀要求
            "exc_": ["Error", "Exception"],  # 异常类必须以Error或Exception结尾
        },
        "_02_dtos": {
            "dto_": {
                "requests": ["Request"],   # 请求DTO以Request结尾
                "responses": ["Response"], # 响应DTO以Response结尾
            }
        },
        "_03_abstracts": {
            "abstract_": {
                # 抽象类后缀 - 与内部接口保持一致
                "data_flow": ["DataFlow"],
                "config": ["Config"],
                "processing": ["Processing", "Processor"],
                "runtime": ["Runtime"],
                "startup": ["Startup"],
                "shutdown": ["Shutdown"],
                "writer": ["Writer"],
                "reader": ["Reader"],
                "creator": ["Creator"],
                "deleter": ["Deleter"],
                "converter": ["Converter"],
                "validator": ["Validator"],
                "handler": ["Handler"],
                "processor": ["Processor"],
                "manager": ["Manager"],
                "extensions": ["Extensions"],
                "formatter": ["Formatter"],
                "parser": ["Parser"],
                "monitor": ["Monitor"],
                "scheduler": ["Scheduler"],
                "registry": ["Registry"],
                "factory": ["Factory"],
                "builder": ["Builder"],
                "adapter": ["Adapter"],
            }
        },
        "_04_models": {
            "model_": ["Model"],       # 模型类必须以Model结尾
            "repo_": ["Repository"],   # Repository实现必须以Repository结尾
        },
        "_05_impls": {
            "impl_": {
                # 实现类后缀 - 与内部接口保持一致，表示具体实现
                "data_flow": ["DataFlow"],
                "config": ["Config"],
                "processing": ["Processing", "Processor"],
                "runtime": ["Runtime"],
                "startup": ["Startup"],
                "shutdown": ["Shutdown"],
                "writer": ["Writer"],
                "reader": ["Reader"],
                "creator": ["Creator"],
                "deleter": ["Deleter"],
                "converter": ["Converter"],
                "validator": ["Validator"],
                "handler": ["Handler"],
                "processor": ["Processor"],
                "manager": ["Manager"],
                "extensions": ["Extensions"],
                "formatter": ["Formatter"],
                "parser": ["Parser"],
                "monitor": ["Monitor"],
                "scheduler": ["Scheduler"],
                "registry": ["Registry"],
                "factory": ["Factory"],
                "builder": ["Builder"],
                "adapter": ["Adapter"],
            }
        },
        "_06_services": {
            "service_": ["Service"],   # 服务类必须以Service结尾
        },
        "_07_router": {
            "router_": [],             # 路由文件无固定后缀要求
            "deps_": [],               # 依赖注入文件无固定后缀要求
        },
    }

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def get_layer_from_path(self, file_path: str) -> str:
        """从文件路径获取层级。"""
        for layer in ["_01_contracts", "_02_dtos", "_03_abstracts", "_04_models", "_05_impls", "_06_services", "_07_router"]:
            if layer in file_path:
                return layer
        return ""

    def get_file_prefix(self, file_path: str) -> str:
        """获取文件前缀。"""
        filename = Path(file_path).stem
        for prefix in ["i_", "r_", "s_", "d_", "e_", "exc_", "dto_", "abstract_", "model_", "repo_", "impl_", "service_", "router_", "deps_"]:
            if filename.startswith(prefix):
                return prefix
        return ""

    def check_class_naming(self, class_name: str, file_path: str, line_no: int, required_prefix: str):
        """检查类命名规范。"""
        layer = self.get_layer_from_path(file_path)
        file_prefix = self.get_file_prefix(file_path)
        
        if not layer or not file_prefix:
            return

        # 基础前缀后缀检查
        self._check_class_prefix_suffix(class_name, file_path, line_no, layer, file_prefix)
        
        # 语义检查
        self._check_class_semantic(class_name, file_path, line_no, layer, file_prefix)

    def _check_class_prefix_suffix(self, class_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查类名前缀和后缀。"""
        # 检查前缀
        if layer in self.CLASS_PREFIX_RULES and file_prefix in self.CLASS_PREFIX_RULES[layer]:
            expected_prefix = self.CLASS_PREFIX_RULES[layer][file_prefix]
            if expected_prefix and not class_name.startswith(expected_prefix):
                self.add_violation(
                    file_path, line_no,
                    f"类名 {class_name} 不符合规范，{layer} 层 {file_prefix} 文件中的类应以 {expected_prefix} 开头"
                )

        # 检查后缀
        if layer in self.CLASS_SUFFIX_RULES and file_prefix in self.CLASS_SUFFIX_RULES[layer]:
            suffix_rule = self.CLASS_SUFFIX_RULES[layer][file_prefix]
            
            if isinstance(suffix_rule, dict):
                # 基于功能类别的后缀检查
                self._check_category_based_suffix(class_name, file_path, line_no, suffix_rule)
            elif isinstance(suffix_rule, list) and suffix_rule:
                # 固定后缀检查
                if not any(class_name.endswith(suffix) for suffix in suffix_rule):
                    self.add_violation(
                        file_path, line_no,
                        f"类名 {class_name} 不符合规范，{layer} 层 {file_prefix} 文件中的类应以 {' 或 '.join(suffix_rule)} 结尾"
                    )

    def _check_category_based_suffix(self, class_name: str, file_path: str, line_no: int, suffix_rule: dict):
        """基于功能类别检查后缀。"""
        # 从文件名推断功能类别
        filename = Path(file_path).stem
        file_prefix = self.get_file_prefix(file_path)
        category_part = filename[len(file_prefix):] if file_prefix else filename
        
        # 查找匹配的类别
        matched_category = None
        for category in suffix_rule.keys():
            if category in category_part:
                matched_category = category
                break
        
        if matched_category and suffix_rule[matched_category]:
            expected_suffixes = suffix_rule[matched_category]
            if not any(class_name.endswith(suffix) for suffix in expected_suffixes):
                self.add_violation(
                    file_path, line_no,
                    f"类名 {class_name} 不符合规范，{matched_category} 功能的类应以 {' 或 '.join(expected_suffixes)} 结尾"
                )

    def _check_class_semantic(self, class_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查类名语义 - 子类可以重写。"""
        # 基础语义检查
        pass


class AbstractMethodNamingChecker(IMethodNamingChecker):
    """方法命名检查抽象实现。"""

    # 方法名规范
    METHOD_NAME_RULES = {
        "_01_contracts": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_prefixes": ["_"],
            "required_patterns": {
                "i_": r"^(get|set|create|update|delete|find|list|count|exists|validate|process|handle|convert|transform|build|parse|format|export|import|clear|flush|close|start|stop|pause|resume|reset|init|destroy|add|remove|insert|batch|async|sync)_",
                "r_": r"^(find|get|create|update|delete|insert|count|exists|batch|async)_",
            }
        },
        # 其他层级规则...
    }

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def check_method_naming(self, method_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查方法命名规范。"""
        # 跳过特殊方法
        if method_name.startswith('__') and method_name.endswith('__'):
            return

        # 基础格式检查
        self._check_method_format(method_name, file_path, line_no, layer, file_prefix)
        
        # 语义检查
        self._check_method_semantic(method_name, file_path, line_no, layer, file_prefix)

    def _check_method_format(self, method_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查方法名格式。"""
        if layer not in self.METHOD_NAME_RULES:
            return

        rules = self.METHOD_NAME_RULES[layer]

        # 检查基础格式
        if "patterns" in rules:
            for pattern in rules["patterns"]:
                if not re.match(pattern, method_name):
                    self.add_violation(
                        file_path, line_no,
                        f"方法名 {method_name} 不符合格式规范 {pattern}"
                    )

        # 检查禁用前缀
        if "forbidden_prefixes" in rules:
            for prefix in rules["forbidden_prefixes"]:
                if method_name.startswith(prefix):
                    self.add_violation(
                        file_path, line_no,
                        f"方法名 {method_name} 不能以 {prefix} 开头"
                    )

        # 检查必需模式
        if "required_patterns" in rules and file_prefix in rules["required_patterns"]:
            required_pattern = rules["required_patterns"][file_prefix]
            if not re.match(required_pattern, method_name):
                self.add_violation(
                    file_path, line_no,
                    f"方法名 {method_name} 在 {file_prefix} 文件中必须符合模式 {required_pattern}"
                )

    def _check_method_semantic(self, method_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查方法名语义 - 子类可以重写。"""
        # 基础语义检查
        pass


class AbstractParameterNamingChecker(IParameterNamingChecker):
    """参数命名检查抽象实现。"""

    # 参数名规范 - 更新规则：其他层只允许I和D类型，且只能单参数
    PARAM_NAME_RULES = {
        "_01_contracts": {
            "allowed_names": ["input", "self"],  # 接口方法只允许 input 参数
            "type_prefixes": ["D", "I"],   # 参数类型必须是 D/E/I 前缀
            "max_params": None,  # 接口层无参数数量限制
        },
        "_02_dtos": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["I", "D"],        # 只允许 I 和 D 类型
            "max_params": 1,                    # 只允许单参数 (除了self)
            "forbidden_names": ["data", "dict", "obj", "item"],
        },
        "_03_abstracts": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["I", "D"],        # 只允许 I 和 D 类型
            "max_params": 1,                    # 只允许单参数 (除了self)
            "forbidden_names": ["data", "obj", "item", "temp"],
        },
        "_04_models": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["I", "D"],        # 只允许 I 和 D 类型
            "max_params": 1,                    # 只允许单参数 (除了self)
            "forbidden_names": ["data", "obj", "item"],
        },
        "_05_impls": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["I", "D"],        # 只允许 I 和 D 类型
            "max_params": 1,                    # 只允许单参数 (除了self)
            "forbidden_names": ["data", "obj", "item", "temp", "val"],
        },
        "_06_services": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["I", "D"],        # 只允许 I 和 D 类型
            "max_params": 1,                    # 只允许单参数 (除了self)
            "forbidden_names": ["data", "obj", "item"],
        },
        "_07_router": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "type_prefixes": ["Dto"],           # 路由层只能使用DTO类型
            "allowed_primitives": ["str", "int", "bool", "float"],  # 路径参数允许基础类型
            "allowed_framework_types": ["Request", "Depends"],  # 允许FastAPI框架类型
            "forbidden_names": ["data", "obj", "item"],
            "max_params": None,  # 路由层可以有多个参数 (路径参数、依赖注入等)
        },
    }

    # 返回值类型规范 - 更新规则：其他层只允许I和D类型
    RETURN_TYPE_RULES = {
        "_01_contracts": {
            "allowed_prefixes": ["D", "I"],  # 接口返回类型必须是契约类型
            "allowed_types": ["None"],            # 或者 None
        },
        "_02_dtos": {
            "allowed_prefixes": ["I", "D"],       # 只允许 I 和 D 类型
            "allowed_types": ["None"],            # 只允许 None
        },
        "_03_abstracts": {
            "allowed_prefixes": ["I", "D"],       # 只允许 I 和 D 类型
            "allowed_types": ["None"],
        },
        "_04_models": {
            "allowed_prefixes": ["I", "D"],       # 只允许 I 和 D 类型
            "allowed_types": ["None"],
        },
        "_05_impls": {
            "allowed_prefixes": ["I", "D"],       # 只允许 I 和 D 类型
            "allowed_types": ["None"],
        },
        "_06_services": {
            "allowed_prefixes": ["I", "D"],       # 只允许 I 和 D 类型
            "allowed_types": ["None"],
        },
        "_07_router": {
            "allowed_prefixes": ["D", "Dto"],     # 路由层返回数据契约或DTO
            "allowed_types": ["None", "dict", "str", "int", "bool"],  # 允许基础类型和dict响应
        },
    }

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def get_layer_from_path(self, file_path: str) -> str:
        """从文件路径获取层级。"""
        for layer in ["_01_contracts", "_02_dtos", "_03_abstracts", "_04_models", "_05_impls", "_06_services", "_07_router"]:
            if layer in file_path:
                return layer
        return ""

    def check_parameter_naming(self, param_name: str, param_type: str, file_path: str, line_no: int, layer: str):
        """检查参数命名规范。"""
        if not layer:
            layer = self.get_layer_from_path(file_path)
        
        if layer not in self.PARAM_NAME_RULES:
            return

        rules = self.PARAM_NAME_RULES[layer]

        # 跳过 self 参数
        if param_name == "self":
            return

        # 检查参数名格式
        if "patterns" in rules:
            for pattern in rules["patterns"]:
                if not re.match(pattern, param_name):
                    self.add_violation(
                        file_path, line_no,
                        f"参数名 {param_name} 不符合格式规范 {pattern}"
                    )

        # 检查禁用名称
        if "forbidden_names" in rules and param_name in rules["forbidden_names"]:
            self.add_violation(
                file_path, line_no,
                f"参数名 {param_name} 是禁用名称，请使用更具体的名称"
            )

        # 检查参数类型前缀
        if param_type and param_type != "":
            self._check_parameter_type(param_name, param_type, file_path, line_no, layer, rules)

    def _check_parameter_type(self, param_name: str, param_type: str, file_path: str, line_no: int, layer: str, rules: dict):
        """检查参数类型规范。"""
        # 处理泛型类型 (如 List[DUser])
        base_type = param_type.split('[')[0] if '[' in param_type else param_type
        
        # 路由层特殊处理
        if layer == "_07_router":
            # 允许框架类型
            if "allowed_framework_types" in rules and base_type in rules["allowed_framework_types"]:
                return
            # 允许基础类型
            if "allowed_primitives" in rules and base_type in rules["allowed_primitives"]:
                return

        # 检查类型前缀
        if "type_prefixes" in rules:
            if not any(base_type.startswith(prefix) for prefix in rules["type_prefixes"]):
                self.add_violation(
                    file_path, line_no,
                    f"参数 {param_name} 的类型 {param_type} 不符合 {layer} 层规范，应使用 {rules['type_prefixes']} 前缀"
                )

    def check_method_parameter_count(self, method_name: str, param_count: int, file_path: str, line_no: int, layer: str):
        """检查方法参数数量规范。"""
        if not layer:
            layer = self.get_layer_from_path(file_path)
        
        if layer not in self.PARAM_NAME_RULES:
            return

        rules = self.PARAM_NAME_RULES[layer]
        
        # 检查参数数量限制 (不包括self)
        if "max_params" in rules and rules["max_params"] is not None:
            # param_count 已经不包括 self，直接比较
            if param_count > rules["max_params"]:
                self.add_violation(
                    file_path, line_no,
                    f"方法 {method_name} 在 {layer} 层只允许最多 {rules['max_params']} 个参数 (除self外)，当前有 {param_count} 个"
                )
        """检查返回值类型命名规范。"""
        if layer not in self.RETURN_TYPE_RULES or not return_type:
            return

        rules = self.RETURN_TYPE_RULES[layer]

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
                    file_path, line_no,
                    f"返回类型 {return_type} 不符合 {layer} 层规范，应使用 {rules['allowed_prefixes']} 前缀"
                )

        # 语义检查
        self._check_return_type_semantic(return_type, file_path, line_no, layer)

    def _check_return_type_semantic(self, return_type: str, file_path: str, line_no: int, layer: str):
        """检查返回值类型语义 - 子类可以重写。"""
        # 基础语义检查
        pass


class AbstractVariableNamingChecker(IVariableNamingChecker):
    """变量命名检查抽象实现。"""

    # 变量名规范 - 按层级和用途区分
    VARIABLE_NAME_RULES = {
        "_01_contracts": {
            # 接口层基本不应该有变量，只有方法签名
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],
            "max_length": 25,
            "required_prefixes": [],  # 接口层变量无特殊要求
        },
        "_02_dtos": {
            # DTO层变量应该语义明确
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value", "dict", "list"],
            "max_length": 30,
            "required_semantic": True,  # 必须有语义含义
        },
        "_03_abstracts": {
            # 抽象层变量应该通用但有意义
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],
            "max_length": 35,
            "allowed_generic": ["result", "output", "input", "context"],  # 允许的通用名称
        },
        "_04_models": {
            # 模型层变量通常是数据库相关
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],
            "max_length": 40,
            "preferred_suffixes": ["_model", "_entity", "_record", "_row"],  # 推荐后缀
        },
        "_05_impls": {
            # 实现层变量应该具体明确
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value", "thing", "stuff"],
            "max_length": 45,
            "required_context": True,  # 必须有上下文含义
        },
        "_06_services": {
            # 服务层变量应该业务导向
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],
            "max_length": 40,
            "business_oriented": True,  # 应该体现业务含义
        },
        "_07_router": {
            # 路由层变量通常是请求/响应相关
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "forbidden_names": ["data", "obj", "item", "temp", "tmp", "val", "value"],
            "max_length": 35,
            "allowed_framework": ["request", "response", "headers", "params", "query"],  # 框架相关允许
        },
        # 特殊变量类型规则
        "loop_variables": {
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "allowed_short": ["i", "j", "k", "idx", "index"],  # 循环变量允许短名称
            "max_length": 15,
        },
        "temporary_variables": {
            # 临时变量有特殊规则
            "patterns": [r"^[a-z][a-z0-9_]*$"],
            "allowed_names": ["result", "output", "processed", "converted", "formatted"],
            "max_length": 25,
            "must_be_local": True,  # 必须是局部变量
        }
    }

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def check_variable_naming(self, var_name: str, file_path: str, line_no: int):
        """检查变量命名规范。"""
        layer = self.get_layer_from_path(file_path)
        
        # 基础格式检查
        self._check_variable_format(var_name, file_path, line_no, layer)
        
        # 语义检查
        self._check_variable_semantic(var_name, file_path, line_no, layer)

    def _check_variable_format(self, var_name: str, file_path: str, line_no: int, layer: str = ""):
        """检查变量名格式。"""
        # 获取层级规则
        if layer and layer in self.VARIABLE_NAME_RULES:
            rules = self.VARIABLE_NAME_RULES[layer]
        else:
            # 默认使用最严格的规则
            rules = self.VARIABLE_NAME_RULES["_05_impls"]

        # 检查基础格式
        if "patterns" in rules:
            for pattern in rules["patterns"]:
                if not re.match(pattern, var_name):
                    self.add_violation(
                        file_path, line_no,
                        f"变量名 {var_name} 不符合格式规范 {pattern}"
                    )

        # 检查长度限制
        if "max_length" in rules and len(var_name) > rules["max_length"]:
            self.add_violation(
                file_path, line_no,
                f"变量名 {var_name} 长度超过 {layer} 层限制 {rules['max_length']} 字符"
            )

        # 检查禁用名称
        if "forbidden_names" in rules and var_name in rules["forbidden_names"]:
            # 检查是否有例外情况
            if not self._is_variable_exception(var_name, layer, rules):
                self.add_violation(
                    file_path, line_no,
                    f"变量名 {var_name} 在 {layer} 层是禁用名称，请使用更具体的名称"
                )

    def _is_variable_exception(self, var_name: str, layer: str, rules: dict) -> bool:
        """检查变量名是否有例外情况。"""
        # 检查是否是允许的通用名称
        if "allowed_generic" in rules and var_name in rules["allowed_generic"]:
            return True
        
        # 检查是否是框架相关允许的名称
        if "allowed_framework" in rules and var_name in rules["allowed_framework"]:
            return True
        
        # 检查是否是循环变量
        loop_rules = self.VARIABLE_NAME_RULES.get("loop_variables", {})
        if "allowed_short" in loop_rules and var_name in loop_rules["allowed_short"]:
            return True
        
        # 检查是否是临时变量的允许名称
        temp_rules = self.VARIABLE_NAME_RULES.get("temporary_variables", {})
        if "allowed_names" in temp_rules and var_name in temp_rules["allowed_names"]:
            return True
        
        return False

    def _check_variable_semantic(self, var_name: str, file_path: str, line_no: int, layer: str):
        """检查变量名语义 - 子类可以重写。"""
        if not layer or layer not in self.VARIABLE_NAME_RULES:
            return
            
        rules = self.VARIABLE_NAME_RULES[layer]
        
        # 检查是否需要语义含义
        if rules.get("required_semantic", False):
            if len(var_name) < 3 or var_name in ["a", "b", "c", "x", "y", "z"]:
                self.add_violation(
                    file_path, line_no,
                    f"变量名 {var_name} 在 {layer} 层必须有明确的语义含义"
                )
        
        # 检查是否需要上下文含义
        if rules.get("required_context", False):
            if not self._has_context_meaning(var_name):
                self.add_violation(
                    file_path, line_no,
                    f"变量名 {var_name} 在 {layer} 层应该体现具体的上下文含义"
                )
        
        # 检查是否需要业务导向
        if rules.get("business_oriented", False):
            if not self._has_business_meaning(var_name):
                self.add_violation(
                    file_path, line_no,
                    f"变量名 {var_name} 在 {layer} 层应该体现业务含义"
                )
        
        # 检查推荐模式
        self._check_preferred_patterns(var_name, file_path, line_no, layer, rules)
        
        # 检查层级特定的命名约定
        self._check_layer_specific_conventions(var_name, file_path, line_no, layer)

    def _check_layer_specific_conventions(self, var_name: str, file_path: str, line_no: int, layer: str):
        """检查层级特定的命名约定。"""
        var_lower = var_name.lower()
        
        if layer == "_01_contracts":
            # 接口层不应该有实例变量
            if not var_name.isupper():  # 不是常量
                self.add_violation(
                    file_path, line_no,
                    f"接口层 {layer} 不应该有实例变量 {var_name}，只应该有方法签名"
                )
        
        elif layer == "_02_dtos":
            # DTO层变量应该体现数据结构
            dto_patterns = ["request", "response", "data", "payload", "params"]
            if not any(pattern in var_lower for pattern in dto_patterns):
                self.add_violation(
                    file_path, line_no,
                    f"DTO层变量 {var_name} 应该体现数据传输概念，建议包含: {', '.join(dto_patterns)}"
                )
        
        elif layer == "_04_models":
            # 模型层变量应该体现数据库概念
            model_patterns = ["entity", "record", "row", "model", "table", "query", "connection"]
            if not any(pattern in var_lower for pattern in model_patterns):
                self.add_violation(
                    file_path, line_no,
                    f"模型层变量 {var_name} 应该体现数据库概念，建议包含: {', '.join(model_patterns[:4])}"
                )
        
        elif layer == "_06_services":
            # 服务层变量应该体现业务流程
            service_patterns = ["process", "handle", "manage", "execute", "perform", "business", "workflow"]
            if not any(pattern in var_lower for pattern in service_patterns) and not self._has_business_meaning(var_name):
                self.add_violation(
                    file_path, line_no,
                    f"服务层变量 {var_name} 应该体现业务流程或业务概念"
                )
        
        elif layer == "_07_router":
            # 路由层变量应该体现HTTP/API概念
            router_patterns = ["request", "response", "endpoint", "route", "api", "http", "params", "query", "headers"]
            if not any(pattern in var_lower for pattern in router_patterns):
                self.add_violation(
                    file_path, line_no,
                    f"路由层变量 {var_name} 应该体现HTTP/API概念，建议包含: {', '.join(router_patterns[:5])}"
                )

    def _has_context_meaning(self, var_name: str) -> bool:
        """检查变量名是否有上下文含义。"""
        # 扩展的上下文指示词
        context_indicators = [
            # 数据相关
            "input", "output", "result", "response", "request", "config", "settings",
            "params", "args", "options", "metadata", "payload", "content",
            
            # 组件相关
            "handler", "processor", "manager", "service", "repository", "model",
            "factory", "builder", "adapter", "converter", "validator", "formatter",
            
            # 业务实体
            "user", "order", "product", "payment", "log", "error", "success",
            "account", "profile", "session", "token", "credential", "permission",
            
            # 状态和流程
            "created", "updated", "deleted", "processed", "validated", "formatted",
            "parsed", "converted", "transformed", "filtered", "sorted", "grouped",
            
            # 数据库相关
            "entity", "record", "row", "query", "connection", "transaction",
            "migration", "schema", "table", "column", "index",
            
            # 时间相关
            "timestamp", "datetime", "duration", "interval", "timeout", "deadline"
        ]
        
        var_lower = var_name.lower()
        return any(indicator in var_lower for indicator in context_indicators)

    def _has_business_meaning(self, var_name: str) -> bool:
        """检查变量名是否有业务含义。"""
        # 扩展的业务词汇库
        business_indicators = [
            # 用户和账户
            "user", "customer", "member", "admin", "guest", "visitor",
            "account", "profile", "identity", "credential", "permission", "role",
            
            # 商品和订单
            "order", "product", "item", "sku", "category", "brand", "inventory",
            "stock", "warehouse", "supplier", "vendor", "manufacturer",
            
            # 支付和财务
            "payment", "transaction", "invoice", "receipt", "refund", "discount",
            "coupon", "promotion", "price", "cost", "fee", "tax", "balance",
            
            # 物流和配送
            "shipping", "delivery", "address", "location", "tracking", "carrier",
            "package", "shipment", "logistics", "fulfillment",
            
            # 营销和销售
            "campaign", "promotion", "advertisement", "lead", "prospect", "conversion",
            "analytics", "metrics", "report", "dashboard", "kpi",
            
            # 内容和媒体
            "content", "article", "post", "comment", "review", "rating", "feedback",
            "image", "video", "document", "file", "attachment",
            
            # 通知和消息
            "notification", "message", "email", "sms", "alert", "reminder",
            "subscription", "newsletter", "announcement"
        ]
        
        var_lower = var_name.lower()
        return any(indicator in var_lower for indicator in business_indicators)

    def _check_preferred_patterns(self, var_name: str, file_path: str, line_no: int, layer: str, rules: dict):
        """检查推荐的命名模式。"""
        if "preferred_suffixes" in rules:
            # 检查是否使用了推荐的后缀
            has_preferred_suffix = any(var_name.endswith(suffix) for suffix in rules["preferred_suffixes"])
            
            # 如果变量名看起来像应该有后缀但没有，给出建议
            if not has_preferred_suffix and self._should_have_suffix(var_name, rules["preferred_suffixes"]):
                suggested_suffixes = ", ".join(rules["preferred_suffixes"])
                self.add_violation(
                    file_path, line_no,
                    f"变量名 {var_name} 在 {layer} 层建议使用后缀: {suggested_suffixes}"
                )

    def _should_have_suffix(self, var_name: str, preferred_suffixes: list) -> bool:
        """判断变量名是否应该有特定后缀。"""
        # 简单的启发式判断
        var_lower = var_name.lower()
        
        # 如果变量名包含这些词，建议加相应后缀
        suffix_hints = {
            "_model": ["user", "order", "product", "account"],
            "_entity": ["database", "db", "table"],
            "_record": ["row", "entry", "item"],
            "_data": ["raw", "source", "input"]
        }
        
        for suffix in preferred_suffixes:
            if suffix in suffix_hints:
                hints = suffix_hints[suffix]
                if any(hint in var_lower for hint in hints):
                    return True
        
        return False

    def check_loop_variable(self, var_name: str, file_path: str, line_no: int):
        """专门检查循环变量命名。"""
        loop_rules = self.VARIABLE_NAME_RULES.get("loop_variables", {})
        
        # 检查是否是允许的短名称
        if "allowed_short" in loop_rules and var_name in loop_rules["allowed_short"]:
            return  # 允许的短名称，通过检查
        
        # 否则按照普通变量规则检查
        self._check_variable_format(var_name, file_path, line_no)

    def check_temporary_variable(self, var_name: str, file_path: str, line_no: int, is_local: bool = True):
        """专门检查临时变量命名。"""
        temp_rules = self.VARIABLE_NAME_RULES.get("temporary_variables", {})
        
        # 检查是否必须是局部变量
        if temp_rules.get("must_be_local", False) and not is_local:
            self.add_violation(
                file_path, line_no,
                f"临时变量 {var_name} 必须是局部变量"
            )
        
        # 检查是否是允许的临时变量名称
        if "allowed_names" in temp_rules and var_name in temp_rules["allowed_names"]:
            return  # 允许的临时变量名称
        
        # 否则按照普通变量规则检查
        self._check_variable_format(var_name, file_path, line_no)


class AbstractEnumNamingChecker(IEnumNamingChecker):
    """枚举命名检查抽象实现。"""

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录 - 子类需要实现。"""
        raise NotImplementedError("子类必须实现 add_violation 方法")

    def check_enum_naming(self, enum_name: str, enum_values: List[str], file_path: str, line_no: int):
        """检查枚举命名规范。"""
        # 检查枚举名
        self._check_enum_name(enum_name, file_path, line_no)
        
        # 检查枚举值
        self._check_enum_values(enum_values, file_path, line_no)

    def _check_enum_name(self, enum_name: str, file_path: str, line_no: int):
        """检查枚举名。"""
        # 枚举名应该以 E 开头
        if not enum_name.startswith('E'):
            self.add_violation(
                file_path, line_no,
                f"枚举名 {enum_name} 应以 E 开头"
            )

        # 枚举名应该是 PascalCase
        if not re.match(r'^E[A-Z][a-zA-Z0-9]*$', enum_name):
            self.add_violation(
                file_path, line_no,
                f"枚举名 {enum_name} 应使用 PascalCase 格式"
            )

    def _check_enum_values(self, enum_values: List[str], file_path: str, line_no: int):
        """检查枚举值。"""
        for value in enum_values:
            # 枚举值应该是 UPPER_CASE
            if not re.match(r'^[A-Z][A-Z0-9_]*$', value):
                self.add_violation(
                    file_path, line_no,
                    f"枚举值 {value} 应使用 UPPER_CASE 格式"
                )


class AbstractNamingChecker(
    AbstractFileNamingChecker,
    AbstractClassNamingChecker,
    AbstractMethodNamingChecker,
    AbstractParameterNamingChecker,
    # AbstractReturnTypeNamingChecker,  # TODO: 需要实现这个类
    AbstractVariableNamingChecker,
    AbstractEnumNamingChecker
):
    """命名检查统一抽象实现 - 组合所有单独的抽象检查器。"""

    def __init__(self):
        """初始化统一命名检查器。"""
        # 调用所有父类的初始化方法
        AbstractFileNamingChecker.__init__(self)
        # 其他父类如果有 __init__ 也需要调用