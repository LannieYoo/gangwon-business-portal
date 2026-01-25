"""接口方法签名检查器抽象实现。"""
import ast

from .i_interface_signature_checker import IInterfaceSignatureChecker


class AbstractInterfaceSignatureChecker(IInterfaceSignatureChecker):
    """接口方法签名检查器抽象实现。"""

    def check_interface_method_signature(self, node: ast.FunctionDef, file_path: str) -> None:
        """检查接口方法签名规范。"""
        # 跳过特殊方法
        if node.name.startswith('__') and node.name.endswith('__'):
            return
            
        # 检查参数数量和类型
        params = [arg for arg in node.args.args if arg.arg != 'self']
        
        if len(params) == 0:
            # 无参数方法：method() -> D*Output | None
            self.check_no_param_method_return_type(node, file_path)
        elif len(params) == 1:
            # 单参数方法：method(input: D*Input) -> D*Output | None  
            self.check_single_param_method_signature(node, file_path, params[0])
        else:
            # 多参数方法：违规
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 参数过多，应该使用单个 dataclass 输入参数",
            )

    def check_no_param_method_return_type(self, node: ast.FunctionDef, file_path: str) -> None:
        """检查无参数方法的返回类型。"""
        if not node.returns:
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 缺少返回类型注解",
            )
            return
            
        return_type = self.get_return_type_name(node.returns)
        
        # 返回类型必须以 Output 结尾或为 None
        if not (return_type.endswith('Output') or return_type == 'None'):
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 返回类型应为 D*Output 或 None，当前为 {return_type}",
            )

    def check_single_param_method_signature(self, node: ast.FunctionDef, file_path: str, param: ast.arg) -> None:
        """检查单参数方法的签名。"""
        # 检查参数类型
        if not param.annotation:
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 参数 {param.arg} 缺少类型注解",
            )
            return
            
        param_type = self.get_type_name(param.annotation)
        
        # 参数类型必须以 Input 结尾
        if not param_type.endswith('Input'):
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 参数类型应为 D*Input，当前为 {param_type}",
            )
            
        # 检查参数名应为 input
        if param.arg != 'input':
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 参数名应为 'input'，当前为 '{param.arg}'",
            )
            
        # 检查返回类型
        if not node.returns:
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 缺少返回类型注解",
            )
            return
            
        return_type = self.get_return_type_name(node.returns)
        
        # 返回类型必须以 Output 结尾或为 None
        if not (return_type.endswith('Output') or return_type == 'None' or 
                return_type.endswith('Output | None') or return_type.startswith('Optional[')):
            self.add_violation(
                file_path, node.lineno,
                f"接口方法 {node.name} 返回类型应为 D*Output 或 None，当前为 {return_type}",
            )

    def get_type_name(self, annotation: ast.AST) -> str:
        """获取类型注解的名称。"""
        if isinstance(annotation, ast.Name):
            return annotation.id
        elif isinstance(annotation, ast.Attribute):
            return annotation.attr
        elif isinstance(annotation, ast.Subscript):
            return self.get_type_name(annotation.value)
        else:
            return str(annotation)
            
    def get_return_type_name(self, returns: ast.AST) -> str:
        """获取返回类型的名称。"""
        if isinstance(returns, ast.Name):
            return returns.id
        elif isinstance(returns, ast.Attribute):
            return returns.attr
        elif isinstance(returns, ast.Constant) and returns.value is None:
            # 处理 None 常量
            return "None"
        elif isinstance(returns, ast.BinOp) and isinstance(returns.op, ast.BitOr):
            # 处理 Type | None 语法
            left = self.get_return_type_name(returns.left)
            right = self.get_return_type_name(returns.right)
            return f"{left} | {right}"
        elif isinstance(returns, ast.Subscript):
            # 处理 Optional[Type] 语法
            if isinstance(returns.value, ast.Name) and returns.value.id == 'Optional':
                inner_type = self.get_return_type_name(returns.slice)
                return f"Optional[{inner_type}]"
            return self.get_return_type_name(returns.value)
        else:
            return str(returns)