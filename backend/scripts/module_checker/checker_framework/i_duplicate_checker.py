"""重复代码检查接口。"""
from abc import ABC, abstractmethod
from typing import Dict, List


class IDuplicateChecker(ABC):
    """重复代码检查接口。"""

    @abstractmethod
    def check_duplicate_implementations(self, abstract_name: str, subclasses: List, abstract_methods: set):
        """检查多个实现类有相同方法实现时，应提取到抽象类。"""
        pass
