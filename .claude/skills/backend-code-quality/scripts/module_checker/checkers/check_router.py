#!/usr/bin/env python3
"""Router 类规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AstHelper,
    AbstractLayerChecker,
    AbstractImportChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractControlFlowChecker,
    AbstractDefensiveChecker,
    AbstractInlineConversionChecker,
    AbstractDatabaseChecker,
    AbstractSignatureChecker,
    AbstractMemberChecker,
    AbstractPrivateMethodChecker,
    run_checker,
)


class RouterChecker(
    AbstractLayerChecker,
    AbstractImportChecker,
    AbstractCodeQualityChecker,
    AbstractAnnotationChecker,
    AbstractControlFlowChecker,
    AbstractDefensiveChecker,
    AbstractInlineConversionChecker,
    AbstractDatabaseChecker,
    AbstractSignatureChecker,
    AbstractMemberChecker,
    AbstractPrivateMethodChecker,
):
    """Router 类规范检查器。"""

    ROUTE_DECORATORS = {'get', 'post', 'put', 'delete', 'patch', 'options', 'head'}
    MAX_ROUTE_PARAMS = 5
    EXCLUDED_PARAMS = {'self', 'current_user'}

    @property
    def name(self) -> str:
        return "Router 类规范"

    @property
    def layer_pattern(self) -> str:
        return "_07_router"

    @property
    def file_prefix(self) -> str:
        return "router_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        self.check_no_any_type(tree, file_path)
        self.check_no_bare_except(tree, file_path)
        self.check_no_internal_imports(tree, file_path)
        self.check_no_forbidden_imports(
            tree, file_path,
            ['sqlalchemy'],
            "Router 层禁止直接导入 sqlalchemy",
        )
        self.check_no_function_internal_imports(tree, file_path)
        self.check_no_list_comprehension_conversion(tree, file_path)
        self.check_no_direct_dto_construction(tree, file_path)
        self.check_no_dict_literal_return(tree, file_path)
        self.check_no_direct_dataclass_construction(tree, file_path)
        self.check_no_dict_literal_argument(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        self.check_no_private_methods(node, file_path)
        self.check_no_private_members(node, file_path)
        self.check_no_class_variables(node, file_path)
        self.check_no_dict_mapping_members(node, file_path)
        self.check_no_quoted_annotations(node, file_path)

    def check_functions(self, tree: ast.AST, file_path: str):
        """检查函数定义。"""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if AstHelper.has_decorator(node, self.ROUTE_DECORATORS):
                    self.check_no_direct_db_operations_in_function(node, file_path)
                    # self.check_no_for_loop_in_function(node, file_path)
                    # self.check_no_while_loop_in_function(node, file_path)
                    self.check_max_param_count(node, file_path, self.MAX_ROUTE_PARAMS, self.EXCLUDED_PARAMS)
                elif not node.name.startswith('_') and not node.name.startswith('get_'):
                    self.add_violation(
                        file_path, node.lineno,
                        f"辅助函数 {node.name} 必须以 _ 开头或 get_ 开头（依赖注入）",
                    )


if __name__ == "__main__":
    run_checker(RouterChecker)
