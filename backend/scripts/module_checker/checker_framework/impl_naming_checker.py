"""命名检查具体实现 - 继承所有抽象检查器。"""
from typing import List

from .abstract_naming_checker import AbstractNamingChecker
from .d_violation import DViolation


class NamingChecker(AbstractNamingChecker):
    """命名检查具体实现类。"""

    def __init__(self):
        """初始化命名检查器。"""
        super().__init__()
        self.violations: List[DViolation] = []

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录。"""
        violation = DViolation.from_params(
            file_path=file_path,
            line_no=line_no,
            message=message,
            rule_type="naming"
        )
        self.violations.append(violation)

    def get_violations(self) -> List[DViolation]:
        """获取所有违规记录。"""
        return self.violations.copy()

    def clear_violations(self):
        """清空违规记录。"""
        self.violations.clear()

    def has_violations(self) -> bool:
        """检查是否有违规记录。"""
        return len(self.violations) > 0