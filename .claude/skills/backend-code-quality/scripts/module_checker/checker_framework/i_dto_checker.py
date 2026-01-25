"""DTO 检查器接口。"""
import ast
from abc import ABC, abstractmethod


class IDtoChecker(ABC):
    """DTO 检查器接口。"""

    @abstractmethod
    def check_dto_file_organization(self, module_path: str) -> None:
        """检查 DTO 文件组织规范。
        
        要求：
        - _02_dtos 层只允许 dto_*.py 文件
        - 使用 Pydantic BaseModel
        """
        pass

    @abstractmethod
    def check_dto_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 DTO 结构规范。
        
        要求：
        - 使用 Pydantic BaseModel
        - Request/Response 后缀命名
        """
        pass

    @abstractmethod
    def check_pydantic_basemodel(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查是否继承 Pydantic BaseModel。"""
        pass

    @abstractmethod
    def check_dto_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 DTO 命名规范。"""
        pass