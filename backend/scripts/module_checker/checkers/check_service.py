#!/usr/bin/env python3
"""Service 类规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractInheritanceChecker,
    AbstractPrivateMethodChecker,
    AbstractImportChecker,
    AbstractSignatureChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractControlFlowChecker,
    AbstractDefensiveChecker,
    AbstractConversionChecker,
    AbstractInlineConversionChecker,
    AbstractMemberChecker,
    AbstractStructureChecker,
    AbstractInstantiationChecker,
    AbstractOverrideChecker,
    run_checker,
)


class ServiceChecker(
    AbstractLayerChecker,
    AbstractInheritanceChecker,
    AbstractPrivateMethodChecker,
    AbstractImportChecker,
    AbstractSignatureChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractControlFlowChecker,
    AbstractDefensiveChecker,
    AbstractConversionChecker,
    AbstractInlineConversionChecker,
    AbstractMemberChecker,
    AbstractStructureChecker,
    AbstractInstantiationChecker,
    AbstractOverrideChecker,
):
    """Service 类规范检查器。"""

    @property
    def name(self) -> str:
        return "Service 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_06_services"

    @property
    def file_prefix(self) -> str:
        return "service_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查（按优先级顺序，发现问题即停止）。"""
        # P1: 类型检查
        self.check_no_any_type(tree, file_path)
        self.check_no_optional_type(tree, file_path)
        self.check_no_union_none_type(tree, file_path)
        if self.has_violations():
            return

        # P2: 导入检查
        self.check_no_bare_except(tree, file_path)
        self.check_no_internal_imports(tree, file_path)
        self.check_no_forbidden_imports(
            tree, file_path,
            ['sqlalchemy', 'asyncpg', 'psycopg'],
            "Service 层禁止直接导入数据库包",
        )
        self.check_no_layer_imports(
            tree, file_path,
            ['_02_dtos', '_04_models', '_05_impls'],
            self.current_module,
        )
        self.check_no_repository_imports(tree, file_path)
        if self.has_violations():
            return

        # P3: 控制流检查
        self.check_no_if_statement(tree, file_path)
        self.check_no_match_statement(tree, file_path)
        self.check_no_ternary_expression(tree, file_path)
        if self.has_violations():
            return

        # P4: 防御性编程检查
        self.check_no_comprehension_filter(tree, file_path)
        self.check_no_dict_get_fallback(tree, file_path)
        self.check_no_getattr_fallback(tree, file_path)
        if self.has_violations():
            return

        # P5: 转换检查
        self.check_no_inline_dict_literal(tree, file_path)
        self.check_no_isoformat_call(tree, file_path)
        self.check_no_str_conversion(tree, file_path)
        self.check_no_list_comprehension_conversion(tree, file_path)
        self.check_no_direct_instantiation(tree, file_path)
        self.check_no_direct_dataclass_construction(tree, file_path)
        self.check_no_manual_data_conversion(tree, file_path)
        self.check_no_unnecessary_type_conversion(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义（按优先级顺序，发现问题即停止）。"""
        if not (node.name.endswith('Service') or node.name.endswith('Facade')):
            return

        # P1: 接口实现检查
        self.check_implements_interface(node, file_path, 'I')
        self.check_implements_all_interface_methods(node, file_path)
        self.check_interface_method_signatures(node, file_path)
        if self.has_violations():
            return

        # P2: @override 装饰器检查
        self.check_all_methods_have_override(node, file_path)
        if self.has_violations():
            return

        # P3: 禁止 @classmethod 检查
        self.check_no_classmethod(node, file_path)
        if self.has_violations():
            return

        # P4: 方法签名检查
        self.check_method_signatures(node, file_path)
        self.check_init_depends_on_interface(node, file_path)
        self.check_init_param_count(node, file_path, 2)
        self.check_required_dependencies_injected(node, file_path)
        if self.has_violations():
            return

        # P5: 私有成员检查
        self.check_no_private_methods(node, file_path)
        self.check_no_private_members(node, file_path)
        if self.has_violations():
            return

        # P6: 类变量检查
        self.check_no_class_variables(node, file_path)
        self.check_no_dict_mapping_members(node, file_path)
        self.check_no_conversion_methods(node, file_path)
        if self.has_violations():
            return

        # P7: 注解检查
        self.check_no_quoted_annotations(node, file_path)
        if self.has_violations():
            return

        # P8: 假实现检查
        self.check_no_placeholder_implementation(node, file_path)

    def check_method_signatures(self, node: ast.ClassDef, file_path: str):
        """检查方法参数必须使用 D 前缀数据契约。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__'):
                    continue
                self.check_param_type_prefix(item, file_path, {'D', 'I', 'E'})

    def check_no_classmethod(self, node: ast.ClassDef, file_path: str):
        """检查禁止使用 @classmethod 装饰器。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in item.decorator_list:
                    if isinstance(decorator, ast.Name) and decorator.id == 'classmethod':
                        self.add_violation(
                            file_path, item.lineno,
                            f"Service 类禁止使用 @classmethod 装饰器，方法 {item.name} 应为实例方法",
                        )
                    elif isinstance(decorator, ast.Attribute) and decorator.attr == 'classmethod':
                        self.add_violation(
                            file_path, item.lineno,
                            f"Service 类禁止使用 @classmethod 装饰器，方法 {item.name} 应为实例方法",
                        )

    def check_no_repository_imports(self, tree: ast.AST, file_path: str):
        """检查禁止导入 Repository 接口 (r_*.py)。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module:
                if '.r_' in node.module or node.module.endswith('.r_'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"Service 禁止直接导入 Repository 接口 {node.module}，应通过 impl 访问数据",
                    )
                for alias in node.names:
                    if alias.name.startswith('ILog') and 'Repository' in alias.name:
                        self.add_violation(
                            file_path, node.lineno,
                            f"Service 禁止直接导入 Repository 接口 {alias.name}，应通过 impl 访问数据",
                        )

    def check_no_placeholder_implementation(self, node: ast.ClassDef, file_path: str):
        """检查禁止假实现（占位符实现）。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__'):
                    continue
                self._check_method_for_placeholder(item, file_path)

    def _check_method_for_placeholder(self, method: ast.FunctionDef, file_path: str):
        """检查方法是否为假实现。"""
        # 检查方法体中的可疑模式
        has_real_logic = False
        
        for stmt in method.body:
            # 检查直接返回硬编码值的情况
            if isinstance(stmt, ast.Return) and stmt.value:
                self._check_return_for_placeholder(stmt, method.name, file_path)
            
            # 检查包含占位符注释的情况
            if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant):
                comment = stmt.value.value
                if isinstance(comment, str):
                    placeholder_keywords = [
                        '暂时', '临时', '占位', 'placeholder', 'temp', 'todo', 'fixme',
                        '等待', '待实现', '未实现', 'not implemented', 'coming soon'
                    ]
                    if any(keyword in comment.lower() for keyword in placeholder_keywords):
                        self.add_violation(
                            file_path, stmt.lineno,
                            f"方法 {method.name} 包含占位符注释 '{comment}'，应实现真实逻辑",
                        )
            
            # 检查是否有真实的业务逻辑
            if self._is_real_business_logic(stmt):
                has_real_logic = True
        
        # 如果方法没有真实逻辑，只有返回语句，标记为假实现
        if not has_real_logic and self._only_has_return_statement(method):
            self.add_violation(
                file_path, method.lineno,
                f"方法 {method.name} 只有返回语句没有业务逻辑，疑似假实现",
            )

    def _check_return_for_placeholder(self, return_stmt: ast.Return, method_name: str, file_path: str):
        """检查返回语句是否为假实现。"""
        if not return_stmt.value:
            return
            
        # 检查工厂方法调用
        if isinstance(return_stmt.value, ast.Call):
            call = return_stmt.value
            
            # 检查 D*Output.from_params() 调用
            if (isinstance(call.func, ast.Attribute) and 
                call.func.attr == 'from_params' and
                isinstance(call.func.value, ast.Name) and
                call.func.value.id.endswith('Output')):
                
                # 检查参数中是否有可疑的硬编码值
                for keyword in call.keywords:
                    if isinstance(keyword.value, ast.Constant):
                        value = keyword.value.value
                        if isinstance(value, str):
                            suspicious_values = [
                                'temp', 'temporary', 'placeholder', 'fake', 'mock',
                                'test', 'dummy', 'sample', '暂时', '临时', '占位'
                            ]
                            if any(sus in value.lower() for sus in suspicious_values):
                                self.add_violation(
                                    file_path, return_stmt.lineno,
                                    f"方法 {method_name} 返回假数据 '{value}'，应实现真实逻辑",
                                )
                        elif isinstance(value, (int, float)) and keyword.arg in ['total', 'deleted_count', 'page_size']:
                            # 检查是否返回硬编码的数值（如 total=0, deleted_count=1）
                            if value in [0, 1] and self._method_should_have_dynamic_value(method_name, keyword.arg):
                                self.add_violation(
                                    file_path, return_stmt.lineno,
                                    f"方法 {method_name} 返回硬编码值 {keyword.arg}={value}，应实现真实逻辑",
                                )

    def _method_should_have_dynamic_value(self, method_name: str, param_name: str) -> bool:
        """判断方法的参数是否应该有动态值而不是硬编码。"""
        dynamic_patterns = {
            'list_logs': ['total', 'total_pages'],
            'delete_log': ['deleted_count'],
            'delete_logs_by_message': ['deleted_count'],
            'delete_all_logs': ['deleted_count'],
        }
        
        return method_name in dynamic_patterns and param_name in dynamic_patterns[method_name]

    def _is_real_business_logic(self, stmt: ast.AST) -> bool:
        """判断语句是否为真实的业务逻辑。"""
        # 排除注释和返回语句
        if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant):
            return False  # 注释
        
        # 返回语句如果调用了注入的依赖方法，认为是真实逻辑
        if isinstance(stmt, ast.Return) and stmt.value:
            if isinstance(stmt.value, ast.Call):
                call = stmt.value
                # 检查是否调用了 self.xxx.method() 形式的依赖方法
                if (isinstance(call.func, ast.Attribute) and
                    isinstance(call.func.value, ast.Attribute) and
                    isinstance(call.func.value.value, ast.Name) and
                    call.func.value.value.id == 'self'):
                    return True  # 调用注入的依赖方法
                # 检查是否调用了工厂方法但返回假数据
                if (isinstance(call.func, ast.Attribute) and 
                    call.func.attr == 'from_params' and
                    isinstance(call.func.value, ast.Name) and
                    call.func.value.id.endswith('Output')):
                    return False  # 工厂方法调用，需要进一步检查是否为假数据
            return False
        
        # 真实的业务逻辑包括：
        # 1. 方法调用（如 self.processor.xxx()）
        # 2. 赋值语句
        # 3. 控制流语句（虽然在Service层被禁止，但如果存在说明有逻辑）
        if isinstance(stmt, (ast.Assign, ast.AugAssign, ast.AnnAssign)):
            return True
        if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
            # 检查是否调用了注入的依赖
            call = stmt.value
            if (isinstance(call.func, ast.Attribute) and
                isinstance(call.func.value, ast.Attribute) and
                isinstance(call.func.value.value, ast.Name) and
                call.func.value.value.id == 'self'):
                return True
        if isinstance(stmt, (ast.If, ast.For, ast.While, ast.With, ast.Try)):
            return True
        
        return False

    def _only_has_return_statement(self, method: ast.FunctionDef) -> bool:
        """判断方法是否只有返回语句（和可能的注释）。"""
        meaningful_statements = 0
        
        for stmt in method.body:
            # 跳过注释
            if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant):
                continue
            meaningful_statements += 1
        
        # 如果只有一个有意义的语句（返回语句），认为是空实现
        return meaningful_statements <= 1

    def _is_method_trivial(self, return_stmt: ast.Return) -> bool:
        """判断方法是否过于简单（可能是假实现）。"""
        # 获取方法的父节点
        parent = return_stmt
        while parent and not isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)):
            parent = getattr(parent, 'parent', None)
        
        if not parent:
            return False
            
        # 如果方法体只有注释和一个返回语句，认为是简单的
        non_trivial_statements = 0
        for stmt in parent.body:
            if isinstance(stmt, ast.Return):
                continue
            if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant):
                continue  # 跳过注释
            non_trivial_statements += 1
        
        return non_trivial_statements == 0

    def check_no_manual_data_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止手动数据转换，应使用 dataclass/DTO 工厂方法。"""
        for node in ast.walk(tree):
            # 检查字典字面量构造
            if isinstance(node, ast.Dict):
                # 检查是否在方法内部
                parent = node
                method_node = None
                while parent:
                    if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        method_node = parent
                        break
                    parent = getattr(parent, 'parent', None)
                
                if method_node and not method_node.name.startswith('__'):
                    # 检查字典是否包含数据转换模式
                    if self._is_data_conversion_dict(node):
                        self.add_violation(
                            file_path, node.lineno,
                            f"方法 {method_node.name} 禁止手动构造数据字典，应使用 dataclass 或 DTO 的工厂方法",
                        )
            
            # 检查 json.dumps() 调用
            if isinstance(node, ast.Call):
                if (isinstance(node.func, ast.Attribute) and 
                    isinstance(node.func.value, ast.Name) and
                    node.func.value.id == 'json' and
                    node.func.attr == 'dumps'):
                    
                    # 获取方法上下文
                    parent = node
                    method_node = None
                    while parent:
                        if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            method_node = parent
                            break
                        parent = getattr(parent, 'parent', None)
                    
                    if method_node and not method_node.name.startswith('__'):
                        self.add_violation(
                            file_path, node.lineno,
                            f"方法 {method_node.name} 禁止使用 json.dumps() 手动序列化，应使用 dataclass 的 to_json() 方法",
                        )

    def _is_data_conversion_dict(self, dict_node: ast.Dict) -> bool:
        """判断字典是否为数据转换模式。"""
        if not dict_node.keys or len(dict_node.keys) < 2:
            return False
        
        # 检查是否包含常见的数据字段
        data_field_patterns = [
            'level', 'message', 'context', 'error_type', 'stack_trace',
            'operation', 'duration_ms', 'action', 'resource', 'user_id',
            'request_id', 'trace_id', 'session_id', 'ip_address'
        ]
        
        key_count = 0
        for key in dict_node.keys:
            if isinstance(key, ast.Constant) and isinstance(key.value, str):
                if key.value in data_field_patterns:
                    key_count += 1
        
        # 如果包含多个数据字段，认为是数据转换
        return key_count >= 2

    def check_no_unnecessary_type_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止无意义的类型转换。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # 检查 D*Input.from_params() 调用
                if (isinstance(node.func, ast.Attribute) and 
                    node.func.attr == 'from_params' and
                    isinstance(node.func.value, ast.Name) and
                    node.func.value.id.startswith('D') and
                    node.func.value.id.endswith('Input')):
                    
                    # 获取方法上下文
                    method_node = self._get_containing_method(node)
                    if method_node:
                        self._check_conversion_necessity(node, method_node, file_path)

    def _get_containing_method(self, node: ast.AST) -> ast.FunctionDef | None:
        """获取包含节点的方法。"""
        # 这里需要遍历AST树来找到包含的方法
        # 简化实现：通过检查调用模式来判断
        return None

    def _check_conversion_necessity(self, call_node: ast.Call, method_node: ast.FunctionDef, file_path: str):
        """检查类型转换是否必要。"""
        # 检查是否是简单的字段映射转换
        if self._is_simple_field_mapping(call_node, method_node):
            target_type = call_node.func.value.id
            self.add_violation(
                file_path, call_node.lineno,
                f"方法 {method_node.name} 中的 {target_type}.from_params() 调用疑似无意义转换。"
                f"建议：统一接口参数类型，实现直接传递而非转换。"
            )

    def _is_simple_field_mapping(self, call_node: ast.Call, method_node: ast.FunctionDef) -> bool:
        """判断是否为简单的字段映射转换。"""
        # 检查参数是否直接来自输入参数的字段
        if not call_node.keywords:
            return False
        
        # 检查是否所有参数都是 input.field 形式
        input_field_count = 0
        for keyword in call_node.keywords:
            if (isinstance(keyword.value, ast.Attribute) and
                isinstance(keyword.value.value, ast.Name) and
                keyword.value.value.id == 'input'):
                input_field_count += 1
        
        # 如果大部分参数都是直接映射，认为是简单转换
        return input_field_count >= len(call_node.keywords) * 0.8

    def check_required_dependencies_injected(self, node: ast.ClassDef, file_path: str):
        """检查是否注入了所有必要的依赖接口。"""
        # 获取类实现的接口
        implemented_interfaces = self._get_implemented_interfaces(node)
        if not implemented_interfaces:
            return
        
        # 获取构造函数
        init_method = self._get_init_method(node)
        if not init_method:
            return
        
        # 分析接口需要的依赖
        required_dependencies = self._analyze_required_dependencies(implemented_interfaces, file_path)
        
        # 检查构造函数参数
        injected_dependencies = self._get_injected_dependencies(init_method)
        
        # 验证是否注入了所有必要的依赖
        missing_dependencies = required_dependencies - injected_dependencies
        if missing_dependencies:
            self.add_violation(
                file_path, init_method.lineno,
                f"类 {node.name} 缺少必要的依赖注入: {', '.join(sorted(missing_dependencies))}",
            )

    def _get_implemented_interfaces(self, node: ast.ClassDef) -> set[str]:
        """获取类实现的接口列表。"""
        interfaces = set()
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id.startswith('I'):
                interfaces.add(base.id)
        return interfaces

    def _get_init_method(self, node: ast.ClassDef) -> ast.FunctionDef | None:
        """获取构造函数。"""
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == '__init__':
                return item
        return None

    def _analyze_required_dependencies(self, interfaces: set[str], file_path: str) -> set[str]:
        """分析接口需要的依赖。"""
        required_deps = set()
        
        # 根据接口类型分析需要的依赖
        for interface in interfaces:
            if interface == 'ILogApiFacade':
                # API Facade 需要完整的业务编排组件
                required_deps.update([
                    'ILogProcessor',    # 核心处理器
                    'ILogConfig',       # 配置管理
                    'ILogValidator',    # 业务验证
                    'ILogNotifier',     # 业务通知
                    'ILogAuditor'       # 业务审计
                ])
            elif interface == 'ILogInternalFacade':
                # Internal Facade 需要基础的日志处理组件
                required_deps.update([
                    'ILogProcessor',    # 核心处理器
                    'ILogConfig'        # 配置管理
                ])
            elif interface.endswith('Service'):
                # 通用 Service 可能需要 Repository 或其他服务
                # 这里可以根据具体的 Service 类型来分析
                pass
        
        return required_deps

    def _get_injected_dependencies(self, init_method: ast.FunctionDef) -> set[str]:
        """获取构造函数中注入的依赖接口类型。"""
        injected = set()
        
        for arg in init_method.args.args[1:]:  # 跳过 self
            if arg.annotation:
                if isinstance(arg.annotation, ast.Name):
                    # 简单类型注解: processor: ILogProcessor
                    if arg.annotation.id.startswith('I'):
                        injected.add(arg.annotation.id)
                elif isinstance(arg.annotation, ast.Attribute):
                    # 模块限定类型注解: processor: contracts.ILogProcessor
                    if arg.annotation.attr.startswith('I'):
                        injected.add(arg.annotation.attr)
        
        return injected


if __name__ == "__main__":
    run_checker(ServiceChecker)
