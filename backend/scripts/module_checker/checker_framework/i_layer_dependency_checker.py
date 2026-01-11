"""层级依赖检查器接口。"""
from abc import abstractmethod
from typing import Protocol


class ILayerDependencyChecker(Protocol):
    """层级依赖检查器接口。"""

    @abstractmethod
    def get_current_layer(self, file_path: str) -> str:
        """获取当前文件所在层。"""
        ...
