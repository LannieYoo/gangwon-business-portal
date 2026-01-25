#!/usr/bin/env python3
"""Impl 类规范检查器。"""
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
    AbstractMemberChecker,
    AbstractInstantiationChecker,
    AbstractStructureChecker,
    AbstractInlineConversionChecker,
    AbstractOverrideChecker,
    AbstractStandardLibraryChecker,
    run_checker,
)


class ImplChecker(
    AbstractLayerChecker,
    AbstractInheritanceChecker,
    AbstractPrivateMethodChecker,
    AbstractImportChecker,
    AbstractSignatureChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractControlFlowChecker,
    AbstractDefensiveChecker,
    AbstractMemberChecker,
    AbstractInstantiationChecker,
    AbstractStructureChecker,
    AbstractInlineConversionChecker,
    AbstractOverrideChecker,
    AbstractStandardLibraryChecker,
):
    """Impl 类规范检查器。"""

    @property
    def name(self) -> str:
        return "Impl 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_05_impls"

    @property
    def file_prefix(self) -> str:
        return "impl_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查（按优先级顺序，发现问题即停止）。"""
        # P1: 方法签名检查（最高优先级）
        self.check_no_any_type(tree, file_path)
        self.check_no_optional_type(tree, file_path)
        self.check_no_union_none_type(tree, file_path)
        if self.has_violations():
            return

        # P2: 标准库服务检查
        self.check_no_direct_standard_library_services(tree, file_path)
        if self.has_violations():
            return

        # P3: 导入检查
        self.check_no_bare_except(tree, file_path)
        self.check_no_internal_imports(tree, file_path)
        self.check_no_constant_class_imports(tree, file_path)
        self.check_no_layer_imports(
            tree, file_path,
            ['_02_dtos', '_04_models', '_06_services', '_07_router'],
            self.current_module,
        )
        if self.has_violations():
            return

        # P4: 模块级状态检查
        self.check_no_module_level_state(tree, file_path)
        if self.has_violations():
            return

        # P5: 控制流检查
        self.check_no_if_statement(tree, file_path)
        self.check_no_match_statement(tree, file_path)
        self.check_no_ternary_expression(tree, file_path)
        # self.check_no_while_loop(tree, file_path)
        self.check_no_lambda(tree, file_path)
        if self.has_violations():
            return

        # P6: 防御性编程检查
        self.check_no_comprehension_filter(tree, file_path)
        self.check_no_dict_get_fallback(tree, file_path)
        self.check_no_getattr_fallback(tree, file_path)
        self.check_no_or_fallback(tree, file_path)
        self.check_no_isinstance(tree, file_path)
        self.check_no_hasattr(tree, file_path)
        self.check_no_assert(tree, file_path)
        if self.has_violations():
            return

        # P7: 代码质量检查
        self.check_no_eval_exec(tree, file_path)
        self.check_no_star_args(tree, file_path)
        self.check_no_setattr_delattr(tree, file_path)
        self.check_no_globals_locals(tree, file_path)
        self.check_no_direct_instantiation(tree, file_path)
        if self.has_violations():
            return

        # P8: 数据组装检查（最低优先级）
        self.check_no_inline_dict_literal(tree, file_path)
        self.check_no_dict_literal_argument(tree, file_path)
        self.check_no_direct_dataclass_construction(tree, file_path)

    def check_no_constant_class_imports(self, tree: ast.AST, file_path: str):
        """检查禁止导入常量类 (c_*.py)。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                if node.module and '.c_' in node.module:
                    self.add_violation(
                        file_path, node.lineno,
                        f"禁止导入常量类 {node.module}，应使用枚举 (e_*) 替代",
                    )
                for alias in node.names:
                    if alias.name.startswith('C') and len(alias.name) > 1 and alias.name[1].isupper():
                        self.add_violation(
                            file_path, node.lineno,
                            f"禁止导入常量类 {alias.name}，应使用枚举 (E*) 替代",
                        )

    def check_no_module_level_state(self, tree: ast.AST, file_path: str):
        """检查禁止模块级状态变量。"""
        allowed_names = {'logger', '__all__', '__name__', '__file__', '__doc__'}
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        if target.id not in allowed_names and not target.id.startswith('_'):
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止模块级状态变量 {target.id}，状态应通过 __init__ 注入",
                            )
                        elif target.id.startswith('_') and target.id not in allowed_names:
                            self.add_violation(
                                file_path, node.lineno,
                                f"禁止模块级私有变量 {target.id}，状态应通过 __init__ 注入",
                            )
            elif isinstance(node, ast.AnnAssign):
                if isinstance(node.target, ast.Name):
                    name = node.target.id
                    if name not in allowed_names:
                        self.add_violation(
                            file_path, node.lineno,
                            f"禁止模块级状态变量 {name}，状态应通过 __init__ 注入",
                        )

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义（按优先级顺序，发现问题即停止）。"""
        # P1: 接口实现检查（最高优先级）
        self.check_implements_interface(node, file_path, 'I')
        if self.has_violations():
            return

        # P2: @override 装饰器检查
        self.check_all_methods_have_override(node, file_path)
        if self.has_violations():
            return

        # P3: 方法签名检查
        self.check_methods_type_prefix(node, file_path, {'D', 'I', 'E'})
        self.check_init_depends_on_interface(node, file_path)
        self.check_init_param_count(node, file_path, 2)
        if self.has_violations():
            return

        # P4: 私有成员检查
        self.check_no_private_methods(node, file_path)
        self.check_no_private_members(node, file_path)
        if self.has_violations():
            return

        # P5: 类变量检查
        self.check_no_class_variables(node, file_path)
        self.check_no_dict_mapping_members(node, file_path)
        if self.has_violations():
            return

        # P6: 注解检查
        self.check_no_quoted_annotations(node, file_path)

    def check_methods_type_prefix(self, node: ast.ClassDef, file_path: str, prefixes: set):
        """检查方法参数必须使用指定前缀类型。"""
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if item.name.startswith('__'):
                    continue
                self.check_param_type_prefix(item, file_path, prefixes)


if __name__ == "__main__":
    run_checker(ImplChecker)
