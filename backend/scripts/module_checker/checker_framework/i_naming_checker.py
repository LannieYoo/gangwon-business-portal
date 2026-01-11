"""命名检查接口 - 每个检查方法一个接口。"""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List


class IFileNamingChecker(ABC):
    """文件命名检查接口。"""

    @abstractmethod
    def check_file_naming(self, file_path: Path, rel_path: str, required_prefix: str):
        """检查文件命名规范。"""
        pass


class IClassNamingChecker(ABC):
    """类命名检查接口。"""

    @abstractmethod
    def check_class_naming(self, class_name: str, file_path: str, line_no: int, required_prefix: str):
        """检查类命名规范。"""
        pass


class IMethodNamingChecker(ABC):
    """方法命名检查接口。"""

    @abstractmethod
    def check_method_naming(self, method_name: str, file_path: str, line_no: int, layer: str, file_prefix: str):
        """检查方法命名规范。"""
        pass


class IParameterNamingChecker(ABC):
    """参数命名检查接口。"""

    @abstractmethod
    def check_parameter_naming(self, param_name: str, param_type: str, file_path: str, line_no: int, layer: str):
        """检查参数命名规范。"""
        pass


class IReturnTypeNamingChecker(ABC):
    """返回值类型命名检查接口。"""

    @abstractmethod
    def check_return_type_naming(self, return_type: str, file_path: str, line_no: int, layer: str):
        """检查返回值类型命名规范。"""
        pass


class IVariableNamingChecker(ABC):
    """变量命名检查接口。"""

    @abstractmethod
    def check_variable_naming(self, var_name: str, file_path: str, line_no: int):
        """检查变量命名规范。"""
        pass

    @abstractmethod
    def check_loop_variable(self, var_name: str, file_path: str, line_no: int):
        """检查循环变量命名规范。"""
        pass

    @abstractmethod
    def check_temporary_variable(self, var_name: str, file_path: str, line_no: int, is_local: bool = True):
        """检查临时变量命名规范。"""
        pass


class IEnumNamingChecker(ABC):
    """枚举命名检查接口。"""

    @abstractmethod
    def check_enum_naming(self, enum_name: str, enum_values: List[str], file_path: str, line_no: int):
        """检查枚举命名规范。"""
        pass


class INamingChecker(
    IFileNamingChecker,
    IClassNamingChecker,
    IMethodNamingChecker,
    IParameterNamingChecker,
    IReturnTypeNamingChecker,
    IVariableNamingChecker,
    IEnumNamingChecker
):
    """命名检查统一接口 - 继承所有单独的检查接口。"""
    pass