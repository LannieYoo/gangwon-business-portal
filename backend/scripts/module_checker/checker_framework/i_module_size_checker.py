"""模块大小检查接口。"""
from abc import ABC, abstractmethod


class IModuleSizeChecker(ABC):
    """模块大小检查接口。"""

    @abstractmethod
    def check_module_interface_count(self, file_path: str, max_interfaces: int) -> None:
        """检查模块接口数量不超过限制。"""
        pass