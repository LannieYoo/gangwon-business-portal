"""违规信息数据契约。"""
from dataclasses import dataclass


@dataclass
class DViolation:
    """违规信息。"""
    file_path: str
    line_no: int
    message: str
