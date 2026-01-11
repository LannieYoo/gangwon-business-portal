"""Model 检查器接口。"""
import ast
from abc import ABC, abstractmethod


class IModelChecker(ABC):
    """Model 检查器接口。"""

    @abstractmethod
    def check_model_file_organization(self, module_path: str) -> None:
        """检查 Model 文件组织规范。
        
        要求：
        - _04_models 层只允许 model_*.py 和 repo_*.py 文件
        - 使用 Pydantic Settings 或 SQLAlchemy
        """
        pass

    @abstractmethod
    def check_model_structure(self, node: ast.ClassDef, file_path: str) -> None:
        """检查 Model 结构规范。
        
        要求：
        - Settings 类使用 Pydantic BaseSettings
        - ORM 模型使用 SQLAlchemy Base
        """
        pass

    @abstractmethod
    def check_settings_class(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 Settings 类规范。"""
        pass

    @abstractmethod
    def check_model_naming(self, node: ast.ClassDef, file_path: str) -> bool:
        """检查 Model 命名规范。"""
        pass

    @abstractmethod
    def check_dto_model_field_matching(self, module_path: str) -> None:
        """检查 DTO 和 Model 字段匹配性。
        
        要求：
        - DTO Response 字段应与对应 Model 字段匹配
        - 字段类型应兼容
        - 关联字段（如 user_email）可以例外
        """
        pass