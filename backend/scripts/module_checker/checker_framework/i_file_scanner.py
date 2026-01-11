"""文件扫描接口。"""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List


class IFileScanner(ABC):
    """文件扫描接口。"""

    @abstractmethod
    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        pass

    @abstractmethod
    def scan_files(self) -> List[Path]:
        """扫描目标文件。"""
        pass
