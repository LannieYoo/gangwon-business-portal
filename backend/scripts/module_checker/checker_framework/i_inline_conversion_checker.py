"""内联转换检查接口。"""
from abc import ABC, abstractmethod
import ast


class IInlineConversionChecker(ABC):
    """内联转换检查接口。"""

    @abstractmethod
    def check_no_inline_dict_literal(self, tree: ast.AST, file_path: str):
        """检查禁止内联字典字面量构建。"""
        pass

    @abstractmethod
    def check_no_isoformat_call(self, tree: ast.AST, file_path: str):
        """检查禁止 .isoformat() 调用。"""
        pass

    @abstractmethod
    def check_no_str_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止 str() 转换调用。"""
        pass

    @abstractmethod
    def check_no_list_comprehension_conversion(self, tree: ast.AST, file_path: str):
        """检查禁止列表推导式中的转换。"""
        pass

    @abstractmethod
    def check_no_direct_dto_construction(self, tree: ast.AST, file_path: str):
        """检查禁止直接构造 DTO 返回值。"""
        pass

    @abstractmethod
    def check_no_dict_literal_return(self, tree: ast.AST, file_path: str):
        """检查禁止返回字典字面量。"""
        pass

    @abstractmethod
    def check_no_direct_dataclass_construction(self, tree: ast.AST, file_path: str):
        """检查禁止直接构造数据契约。"""
        pass

    @abstractmethod
    def check_no_dict_literal_argument(self, tree: ast.AST, file_path: str):
        """检查禁止字典字面量作为函数参数。"""
        pass

    @abstractmethod
    def check_no_function_internal_imports(self, tree: ast.AST, file_path: str):
        """检查禁止函数内部导入。"""
        pass
