"""Repository 类规范检查器抽象实现。"""
import ast
from .i_repository_checker import IRepositoryChecker


class AbstractRepositoryChecker(IRepositoryChecker):
    """Repository 类规范检查器抽象实现。"""

    def check_repository_interface_implementation(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 是否实现了对应的接口。"""
        # 检查是否继承了 Repository 接口
        has_repository_interface = False
        
        for base in node.bases:
            if isinstance(base, ast.Name):
                if base.id.startswith('I') and 'Repository' in base.id:
                    has_repository_interface = True
                    break
            elif isinstance(base, ast.Attribute):
                if base.attr.startswith('I') and 'Repository' in base.attr:
                    has_repository_interface = True
                    break
        
        if not has_repository_interface:
            self.add_violation(
                file_path, node.lineno,
                f"Repository 类 {node.name} 必须实现对应的 Repository 接口 (I*Repository)"
            )

    def check_repository_dependency_injection(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 依赖注入规范。"""
        init_method = None
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == '__init__':
                init_method = item
                break
        
        if not init_method:
            self.add_violation(
                file_path, node.lineno,
                f"Repository 类 {node.name} 必须有 __init__ 方法进行依赖注入"
            )
            return
        
        # 检查是否有数据库会话参数
        if len(init_method.args.args) < 2:  # self + 至少一个依赖
            self.add_violation(
                file_path, init_method.lineno,
                f"Repository 类 {node.name} 的 __init__ 方法必须注入数据库会话或 ORM 依赖"
            )

    def check_repository_data_access(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Repository 数据访问逻辑。"""
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name != '__init__':
                # 检查方法是否只包含数据访问逻辑，不包含业务逻辑
                self.check_method_data_access_only(item, file_path)

    def check_method_data_access_only(self, method: ast.FunctionDef, file_path: str) -> None:
        """检查方法是否只包含数据访问逻辑。"""
        # 这里可以添加更复杂的逻辑来检查是否包含业务逻辑
        # 例如：检查是否有复杂的计算、业务规则验证等
        pass