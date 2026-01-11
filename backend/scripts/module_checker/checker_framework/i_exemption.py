#!/usr/bin/env python3
"""豁免接口定义。"""
from abc import ABC, abstractmethod
from pathlib import Path


class IExemption(ABC):
    """豁免接口。"""

    @abstractmethod
    def is_file_exempt(self, file_path: Path) -> bool:
        """判断文件是否豁免检查。"""
        pass

    @abstractmethod
    def is_function_exempt(self, file_path: Path, function_name: str) -> bool:
        """判断函数是否豁免检查。"""
        pass

    @abstractmethod
    def is_method_exempt(self, file_path: Path, class_name: str, method_name: str) -> bool:
        """判断方法是否豁免检查。"""
        pass

    @abstractmethod
    def is_static_method_exempt(self, file_path: Path) -> bool:
        """判断静态方法是否豁免检查。"""
        pass