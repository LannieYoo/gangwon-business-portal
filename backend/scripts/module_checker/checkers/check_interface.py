#!/usr/bin/env python3
"""Interface 类规范检查器。"""
import ast
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractSignatureChecker,
    AbstractInterfaceSizeChecker,
    AbstractModuleSizeChecker,
    AbstractInterfaceSignatureChecker,
    run_checker,
)


class InterfaceChecker(
    AbstractLayerChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractSignatureChecker,
    AbstractInterfaceSizeChecker,
    AbstractModuleSizeChecker,
    AbstractInterfaceSignatureChecker,
):
    """Interface 类规范检查器。"""

    SIMILAR_METHOD_PATTERNS = [
        (r'^list_(\w+)_logs$', 'list_logs'),
        (r'^list_logs_by_type$', 'list_logs'),
        (r'^list_logs$', 'list_logs'),
        (r'^get_(\w+)_log$', 'get_log'),
        (r'^get_log$', 'get_log'),
        (r'^write_(\w+)_log$', 'write_log'),
        (r'^write_log$', 'write_log'),
    ]

    @property
    def name(self) -> str:
        return "Interface 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_01_contracts"

    @property
    def file_prefix(self) -> str:
        return "i_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        self.check_no_any_type(tree, file_path)
        self.check_no_bare_except(tree, file_path)
        # 新增：检查同一模块内接口参数类型一致性
        self.check_interface_parameter_consistency(tree, file_path)
        # 新增：检查接口方法语义重复
        self.check_interface_method_semantic_consistency(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        if not node.name.startswith('I'):
            return
        if len(node.name) < 2 or not node.name[1].isupper():
            return

        self.check_interface_method_count(node, file_path, max_methods=7)
        self.check_all_methods_abstract(node, file_path)
        self.check_no_implementation(node, file_path)
        self.check_no_quoted_annotations(node, file_path)
        self.check_method_params(node, file_path)
        self.check_duplicate_methods(node, file_path)

    def check_method_params(self, node: ast.ClassDef, file_path: str):
        """检查方法参数类型前缀和数量。"""
        allowed_prefixes = {'I', 'D', 'E'}
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__') and item.name.endswith('__'):
                    continue
                self.check_param_type_prefix(item, file_path, allowed_prefixes)
                self.check_max_param_count(item, file_path, max_count=1, excluded_params={'self'})
                # 新增：检查接口方法签名规范
                self.check_interface_method_signature(item, file_path)

    def check_duplicate_methods(self, node: ast.ClassDef, file_path: str):
        """检查重复的接口方法定义。"""
        method_groups = {}
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__') and item.name.endswith('__'):
                    continue
                for pattern, group_name in self.SIMILAR_METHOD_PATTERNS:
                    if re.match(pattern, item.name):
                        if group_name not in method_groups:
                            method_groups[group_name] = []
                        method_groups[group_name].append(item.name)
                        break

        for group_name, methods in method_groups.items():
            if len(methods) > 1:
                self.add_violation(
                    file_path, node.lineno,
                    f"接口 {node.name} 存在重复方法定义 ({', '.join(methods)})，应合并为通用方法 {group_name}",
                )

    def check_all_methods_abstract(self, node: ast.ClassDef, file_path: str):
        """检查所有方法必须是抽象方法。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__') and item.name.endswith('__'):
                    continue
                is_abstract = any(
                    (isinstance(d, ast.Name) and d.id == 'abstractmethod') or
                    (isinstance(d, ast.Attribute) and d.attr == 'abstractmethod')
                    for d in item.decorator_list
                )
                if not is_abstract:
                    self.add_violation(
                        file_path, item.lineno,
                        f"接口方法 {item.name} 必须使用 @abstractmethod 装饰器",
                    )

    def check_no_implementation(self, node: ast.ClassDef, file_path: str):
        """检查接口不能有实现代码。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__') and item.name.endswith('__'):
                    continue
                for stmt in item.body:
                    if isinstance(stmt, ast.Pass):
                        continue
                    if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant):
                        continue
                    if isinstance(stmt, ast.Raise):
                        continue
                    self.add_violation(
                        file_path, stmt.lineno,
                        f"接口方法 {item.name} 不能有实现代码",
                    )
                    break

    def check_interface_parameter_consistency(self, tree: ast.AST, file_path: str):
        """检查接口参数类型一致性。"""
        # 收集所有接口方法的参数信息
        parameter_types = {}  # {semantic_name: {type_name: [locations]}}
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef) and node.name.startswith('I'):
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        if item.name.startswith('__'):
                            continue
                        self._collect_method_parameters(item, node.name, parameter_types, file_path)
        
        # 检查相同语义参数的类型一致性
        self._validate_parameter_consistency(parameter_types, file_path)

    def _collect_method_parameters(self, method: ast.FunctionDef, interface_name: str, 
                                 parameter_types: dict, file_path: str):
        """收集方法参数信息。"""
        for arg in method.args.args[1:]:  # 跳过 self
            if arg.annotation:
                param_name = arg.arg
                type_name = self._extract_type_name(arg.annotation)
                
                # 识别参数的语义含义
                semantic_name = self._get_parameter_semantic(param_name, method.name)
                
                if semantic_name:
                    if semantic_name not in parameter_types:
                        parameter_types[semantic_name] = {}
                    
                    if type_name not in parameter_types[semantic_name]:
                        parameter_types[semantic_name][type_name] = []
                    
                    parameter_types[semantic_name][type_name].append({
                        'interface': interface_name,
                        'method': method.name,
                        'param': param_name,
                        'line': method.lineno,
                        'file': file_path
                    })

    def _extract_type_name(self, annotation: ast.AST) -> str:
        """提取类型名称。"""
        if isinstance(annotation, ast.Name):
            return annotation.id
        elif isinstance(annotation, ast.Attribute):
            return annotation.attr
        elif isinstance(annotation, ast.Subscript):
            return self._extract_type_name(annotation.value)
        return "Unknown"

    def _get_parameter_semantic(self, param_name: str, method_name: str) -> str | None:
        """识别参数的语义含义。"""
        # 定义语义映射规则 - 只检查真正应该一致的语义
        semantic_patterns = {
            'log_id': ['log_id'],        # 日志ID - 应该统一类型
            'user_id': ['user_id'],      # 用户ID - 应该统一类型  
            'trace_id': ['trace_id'],    # 追踪ID - 应该统一类型
            'request_id': ['request_id'], # 请求ID - 应该统一类型
        }
        
        # 根据参数名精确匹配语义（避免 input 这种通用参数）
        for semantic, patterns in semantic_patterns.items():
            if param_name in patterns:
                return semantic
        
        # 根据方法名和参数名组合推断特定语义
        if method_name in ['get_log', 'delete_log', 'get_by_id'] and param_name in ['log_id', 'id']:
            return 'log_id'
        
        return None

    def _validate_parameter_consistency(self, parameter_types: dict, file_path: str):
        """验证参数类型一致性。"""
        for semantic_name, type_mapping in parameter_types.items():
            if len(type_mapping) > 1:
                # 发现同一语义使用了不同类型
                type_details = []
                for type_name, locations in type_mapping.items():
                    for loc in locations:
                        type_details.append(f"{loc['interface']}.{loc['method']}({loc['param']}: {type_name})")
                
                # 报告不一致问题
                first_location = next(iter(type_mapping.values()))[0]
                self.add_violation(
                    file_path, first_location['line'],
                    f"参数语义 '{semantic_name}' 在不同接口中使用了不一致的类型: {', '.join(type_details)}。"
                    f"建议统一使用同一类型或重新设计接口。"
                )

    def check_interface_method_semantic_consistency(self, tree: ast.AST, file_path: str):
        """检查接口方法的语义一致性 - 防止相同功能使用不同参数类型。"""
        # 收集所有接口方法信息
        interface_methods = {}  # {semantic_action: [(interface, method, param_type)]}
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef) and node.name.startswith('I'):
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        if item.name.startswith('__'):
                            continue
                        
                        # 识别方法的语义动作
                        semantic_action = self._get_method_semantic_action(item.name)
                        if semantic_action:
                            param_types = self._get_method_param_types(item)
                            
                            if semantic_action not in interface_methods:
                                interface_methods[semantic_action] = []
                            
                            interface_methods[semantic_action].append({
                                'interface': node.name,
                                'method': item.name,
                                'param_types': param_types,
                                'line': item.lineno
                            })
        
        # 检查相同语义动作是否使用了不同的参数类型
        self._validate_semantic_action_consistency(interface_methods, file_path)

    def _get_method_semantic_action(self, method_name: str) -> str | None:
        """识别方法的语义动作。"""
        action_patterns = {
            'get_by_id': ['get_log', 'get_by_id', 'get_.*_by_id'],
            'list_items': ['list_logs', 'list_.*'],
            'create_item': ['create_log', 'create_.*'],
            'delete_by_id': ['delete_log', 'delete_.*_by_id'],
            'delete_by_condition': ['delete_.*_by_.*'],
        }
        
        import re
        for action, patterns in action_patterns.items():
            for pattern in patterns:
                if re.match(pattern, method_name):
                    return action
        return None

    def _get_method_param_types(self, method: ast.FunctionDef) -> list[str]:
        """获取方法的参数类型列表。"""
        param_types = []
        for arg in method.args.args[1:]:  # 跳过 self
            if arg.annotation:
                type_name = self._extract_type_name(arg.annotation)
                param_types.append(type_name)
        return param_types

    def _validate_semantic_action_consistency(self, interface_methods: dict, file_path: str):
        """验证相同语义动作的参数类型一致性。"""
        for action, methods in interface_methods.items():
            if len(methods) > 1:
                # 检查参数类型是否一致
                param_type_groups = {}
                for method_info in methods:
                    param_signature = tuple(method_info['param_types'])
                    if param_signature not in param_type_groups:
                        param_type_groups[param_signature] = []
                    param_type_groups[param_signature].append(method_info)
                
                # 如果有多种参数签名，报告不一致
                if len(param_type_groups) > 1:
                    details = []
                    first_line = None
                    
                    for signature, method_list in param_type_groups.items():
                        for method_info in method_list:
                            details.append(
                                f"{method_info['interface']}.{method_info['method']}({', '.join(signature)})"
                            )
                            if first_line is None:
                                first_line = method_info['line']
                    
                    self.add_violation(
                        file_path, first_line or 1,
                        f"相同语义动作 '{action}' 在不同接口中使用了不一致的参数类型:\n"
                        f"  {chr(10).join(details)}\n"
                        f"建议：统一参数类型，避免后续 Service 层需要转换。"
                    )


if __name__ == "__main__":
    run_checker(InterfaceChecker)
