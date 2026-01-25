"""导入检查接口。"""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Set
import ast


class IImportChecker(ABC):
    """导入检查接口。"""

    @abstractmethod
    def check_no_forbidden_imports(self, tree: ast.AST, file_path: str, forbidden: List[str], message: str):
        """检查禁止的导入。"""
        pass

    @abstractmethod
    def check_no_layer_imports(self, tree: ast.AST, file_path: str, forbidden_layers: List[str], current_module: str):
        """检查禁止导入其他模块的指定层。"""
        pass

    @abstractmethod
    def check_function_internal_imports(self, tree: ast.AST, file_path: str) -> None:
        """检查函数内部导入。"""
        pass

    @abstractmethod
    def check_init_exports(self, tree: ast.AST, file_path: str, path: Path) -> None:
        """检查 __init__.py 的导出是否有效。"""
        pass

    @abstractmethod
    def validate_init_import(self, file_path: Path, node: ast.ImportFrom, file_path_str: str) -> None:
        """验证 __init__.py 中的 from ... import ... 语句。"""
        pass

    @abstractmethod
    def check_relative_imports(self, tree: ast.AST, file_path: str, path: Path) -> None:
        """检查相对导入路径是否正确。"""
        pass

    @abstractmethod
    def validate_relative_path(self, file_path: Path, node: ast.ImportFrom, file_path_str: str) -> None:
        """验证相对导入路径。"""
        pass

    @abstractmethod
    def get_defined_symbols(self, file_path: Path) -> Set[str]:
        """获取文件中定义的所有符号。"""
        pass
