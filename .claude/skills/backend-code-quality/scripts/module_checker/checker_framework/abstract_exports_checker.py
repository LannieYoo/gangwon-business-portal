"""导出检查抽象类。"""
import ast
from pathlib import Path

from .i_exports_checker import IExportsChecker


class AbstractExportsChecker(IExportsChecker):
    """导出检查抽象类。"""

    def check_module_exports(self, tree: ast.AST, file_path: str):
        """检查模块导出规范。"""
        if not file_path.endswith("__init__.py"):
            return
        
        # 只检查模块根目录的 __init__.py
        if not self._is_module_root_init(file_path):
            return
            
        self.check_allowed_exports_only(tree, file_path)

    def check_allowed_exports_only(self, tree: ast.AST, file_path: str):
        """检查只导出允许的类型（接口和服务）。"""
        # 收集所有导入和 __all__ 定义
        imports = []
        all_exports = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "__all__":
                        if isinstance(node.value, ast.List):
                            for elt in node.value.elts:
                                if isinstance(elt, ast.Constant):
                                    all_exports.append(elt.value)

        # 检查导入的类型
        for import_name in imports:
            if not self._is_allowed_export(import_name):
                self.add_violation(
                    file_path, 1,
                    f"模块不应导出 {import_name}，只能导出接口（I前缀）和服务类（Service后缀）",
                )

        # 检查 __all__ 中的导出
        for export_name in all_exports:
            if not self._is_allowed_export(export_name):
                self.add_violation(
                    file_path, 1,
                    f"__all__ 不应包含 {export_name}，只能导出接口（I前缀）和服务类（Service后缀）",
                )

    def _is_module_root_init(self, file_path: str) -> bool:
        """检查是否为模块根目录的 __init__.py。"""
        path = Path(file_path)
        # 检查路径模式：modules/{module_name}/__init__.py
        parts = path.parts
        # 查找 modules 目录，然后检查是否为其子目录的 __init__.py
        try:
            modules_index = parts.index("modules")
            # modules/{module_name}/__init__.py 的模式
            return (len(parts) >= modules_index + 3 and 
                    parts[-1] == "__init__.py" and
                    len(parts) == modules_index + 3)  # 确保是直接子目录
        except ValueError:
            return False

    def _is_allowed_export(self, name: str) -> bool:
        """检查是否为允许的导出类型。"""
        # 禁止导出 Settings 类（内部配置）- 优先检查
        if 'Settings' in name:
            return False
        
        # 禁止导出抽象类
        if name.startswith('Abstract'):
            return False
        
        # 允许接口（I 前缀）
        if name.startswith('I') and len(name) > 1 and name[1].isupper():
            return True
        
        # 允许数据契约（D 前缀）- 但排除 Settings 类
        if name.startswith('D') and len(name) > 1 and name[1].isupper():
            return True
        
        # 允许枚举（E 前缀）
        if name.startswith('E') and len(name) > 1 and name[1].isupper():
            return True
        
        # 允许异常类（Error 后缀）
        if name.endswith('Error'):
            return True
        
        # 允许服务类（Service 后缀）
        if name.endswith('Service'):
            return True
        
        # 允许服务实例（小写，通常是 service 实例）
        if name.islower() and 'service' in name:
            return True
        
        # 允许依赖注入函数（get_ 前缀的小写函数）
        if name.startswith('get_') and name.islower():
            return True
        
        # 不允许导出的类型：
        # - 具体实现类（非 Service 的类）
        # - 工具类、帮助类
        # - 内部配置类（如 Settings）
        # - 抽象类（Abstract 前缀）
        # - 常量类（C 前缀）
            
        return False