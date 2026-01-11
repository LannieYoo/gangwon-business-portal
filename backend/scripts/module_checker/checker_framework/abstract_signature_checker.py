"""方法签名检查抽象类。"""
import ast
from typing import Set

from .i_signature_checker import ISignatureChecker


class AbstractSignatureChecker(ISignatureChecker):
    """方法签名检查抽象类。"""

    PRIMITIVE_TYPES: Set[str] = {
        'int', 'str', 'float', 'bool', 'bytes',
        'None', 'type', 'Callable',
    }

    FORBIDDEN_PRIMITIVE_TYPES: Set[str] = {
        'list', 'dict', 'tuple', 'set',
        'List', 'Dict', 'Tuple', 'Set', 'Optional', 'Union', 'Any',
    }

    def check_param_type_prefix(self, node: ast.FunctionDef, file_path: str, allowed_prefixes: Set[str]):
        """检查方法参数类型前缀。"""
        for arg in node.args.args:
            if arg.arg == 'self':
                continue
            if not arg.annotation:
                continue

            annotation_str = ast.unparse(arg.annotation)
            base_type = annotation_str.split('[')[0].strip().strip("'\"")

            if base_type in self.FORBIDDEN_PRIMITIVE_TYPES:
                self.add_violation(
                    file_path, node.lineno,
                    f"方法 {node.name} 参数 {arg.arg} 禁止使用原始类型 {base_type}，应使用 D 前缀 dataclass",
                )
                continue

            if base_type in self.PRIMITIVE_TYPES:
                continue

            has_valid_prefix = any(
                base_type.startswith(prefix) and len(base_type) > len(prefix) and base_type[len(prefix)].isupper()
                for prefix in allowed_prefixes
            )

            if not has_valid_prefix:
                self.add_violation(
                    file_path, node.lineno,
                    f"方法 {node.name} 参数 {arg.arg} 必须使用 {'/'.join(allowed_prefixes)} 前缀类型，当前: {annotation_str}",
                )

    def check_return_type_consistency(self, interface_method: ast.FunctionDef, impl_method: ast.FunctionDef, file_path: str):
        """检查返回类型一致性。"""
        if not interface_method.returns or not impl_method.returns:
            return

        iface_return = ast.unparse(interface_method.returns).replace(" ", "").replace("'", "").replace('"', '')
        impl_return = ast.unparse(impl_method.returns).replace(" ", "").replace("'", "").replace('"', '')

        if iface_return != impl_return:
            self.add_violation(
                file_path, impl_method.lineno,
                f"方法 {impl_method.name} 返回类型与接口不一致 (接口: {iface_return}, 实现: {impl_return})",
            )

    def check_param_count_consistency(self, interface_method: ast.FunctionDef, impl_method: ast.FunctionDef, file_path: str):
        """检查参数数量一致性。"""
        iface_args = len(interface_method.args.args)
        impl_args = len(impl_method.args.args)

        if iface_args != impl_args:
            self.add_violation(
                file_path, impl_method.lineno,
                f"方法 {impl_method.name} 参数数量与接口不一致 (接口: {iface_args}, 实现: {impl_args})",
            )

    def check_max_param_count(self, node: ast.FunctionDef, file_path: str, max_count: int, excluded_params: Set[str]):
        """检查参数数量上限。"""
        query_params = []
        for arg in node.args.args:
            if arg.arg in excluded_params:
                continue
            if arg.annotation:
                annotation_str = ast.unparse(arg.annotation)
                if 'Depends' in annotation_str:
                    continue
            query_params.append(arg.arg)

        for arg in node.args.kwonlyargs:
            if arg.arg in excluded_params:
                continue
            if arg.annotation:
                annotation_str = ast.unparse(arg.annotation)
                if 'Depends' in annotation_str:
                    continue
            query_params.append(arg.arg)

        if len(query_params) > max_count:
            self.add_violation(
                file_path, node.lineno,
                f"函数 {node.name} 参数过多 ({len(query_params)} 个)，超过 {max_count} 个应使用 dataclass 封装",
            )
