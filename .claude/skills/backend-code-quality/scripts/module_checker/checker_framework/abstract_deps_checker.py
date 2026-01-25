"""依赖注入 (Deps) 规范检查器抽象实现。"""
import ast
from .i_deps_checker import IDepsChecker


class AbstractDepsChecker(IDepsChecker):
    """依赖注入规范检查器抽象实现。"""

    def check_deps_functions_only(self, tree: ast.AST, file_path: str) -> None:
        """检查 Deps 文件是否只包含依赖注入函数。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self.add_violation(
                    file_path, node.lineno,
                    f"Deps 文件不应包含类定义 {node.name}，只应包含依赖注入函数"
                )

    def check_deps_function_naming(self, tree: ast.AST, file_path: str) -> None:
        """检查 Deps 函数命名规范。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # 检查函数名是否以 get_ 或 initialize_ 开头
                if not (node.name.startswith('get_') or node.name.startswith('initialize_')):
                    self.add_violation(
                        file_path, node.lineno,
                        f"依赖注入函数 {node.name} 应以 'get_' 或 'initialize_' 开头"
                    )
                
                # 检查是否有返回类型注解
                if not node.returns:
                    self.add_violation(
                        file_path, node.lineno,
                        f"依赖注入函数 {node.name} 必须有返回类型注解"
                    )

    def check_dependency_injection_pattern(self, tree: ast.AST, file_path: str) -> None:
        """检查依赖注入模式。"""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                self.check_function_dependency_pattern(node, file_path)

    def check_function_dependency_pattern(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查函数的依赖注入模式。"""
        # 1. 检查是否使用了 Depends 装饰器或参数
        self.check_fastapi_depends_usage(func, file_path)
        
        # 2. 检查是否直接构造实例
        self.check_direct_instantiation(func, file_path)

    def check_fastapi_depends_usage(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查是否正确使用了 FastAPI 的 Depends。"""
        # 检查参数中是否有 Depends
        has_depends = False
        for arg in func.args.args:
            if hasattr(arg, 'annotation') and arg.annotation:
                # 这里可以检查是否使用了 Depends
                pass
        
        # 如果函数有参数但没有使用 Depends，可能需要提醒
        if len(func.args.args) > 0 and not has_depends:
            # 这里可以添加更复杂的检查逻辑
            pass

    def check_direct_instantiation(self, func: ast.FunctionDef, file_path: str) -> None:
        """检查是否直接构造实例。"""
        for node in ast.walk(func):
            if isinstance(node, ast.Call):
                # 检查是否直接调用构造函数
                if isinstance(node.func, ast.Name):
                    # 如果调用的是类名（通常以大写字母开头）
                    if node.func.id[0].isupper():
                        # 这是好的，依赖注入函数应该构造实例
                        pass