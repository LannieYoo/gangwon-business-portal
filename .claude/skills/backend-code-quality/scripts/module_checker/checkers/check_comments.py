#!/usr/bin/env python3
"""注释规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractCommentChecker,
    IChecker,
    DViolation,
    run_checker,
)


class CommentChecker(AbstractCommentChecker, IChecker):
    """注释规范检查器。"""

    def __init__(self, module_path: str = ""):
        """初始化检查器。"""
        self.module_path = Path(module_path) if module_path else Path.cwd()
        self.violations = []

    @property
    def name(self) -> str:
        return "注释规范"

    def check(self) -> int:
        """运行检查，返回违规数量。"""
        if self.module_path.is_file():
            files = [self.module_path]
        else:
            files = list(self.module_path.rglob("*.py"))
        
        for file_path in files:
            self.check_file(str(file_path))
        
        return len(self.violations)

    def add_violation(self, file_path: str, line_number: int, message: str):
        """添加违规记录。"""
        violation = DViolation(
            file_path=file_path,
            line_no=line_number,
            message=message
        )
        self.violations.append(violation)

    def has_violations(self) -> bool:
        """检查是否有违规。"""
        return len(self.violations) > 0

    def get_violations(self):
        """获取所有违规。"""
        return self.violations

    def check_file(self, file_path: str) -> bool:
        """检查单个文件。"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content, filename=file_path)
            self.check_file_level(tree, file_path)
            
            return not self.has_violations()
        except Exception as e:
            self.add_violation(file_path, 0, f"文件解析失败: {e}")
            return False

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        # P1: Docstring 格式检查
        self.check_docstring_format(tree, file_path)
        if self.has_violations():
            return

        # P2: 禁止项检查
        self.check_no_requirements_reference(tree, file_path)
        self.check_no_type_duplication_in_docstring(tree, file_path)
        if self.has_violations():
            return

        # P3: 注释质量检查
        self.check_no_grouping_comments(tree, file_path)
        self.check_inline_comment_necessity(tree, file_path)

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        # 类级别的注释检查已在 check_file_level 中处理
        pass


def main():
    """主函数。"""
    if len(sys.argv) != 2:
        print("Usage: python check_comments.py <file_or_directory>")
        sys.exit(1)
    
    target_path = Path(sys.argv[1])
    checker = CommentChecker(str(target_path))
    
    if target_path.is_file():
        files = [target_path]
    else:
        files = list(target_path.rglob("*.py"))
    
    total_violations = 0
    for file_path in files:
        checker.violations = []  # 重置违规列表
        checker.check_file(str(file_path))
        
        if checker.has_violations():
            print(f"\n{file_path}:")
            for violation in checker.get_violations():
                print(f"  Line {violation.line_no}: {violation.message}")
                total_violations += 1
    
    if total_violations == 0:
        print("✅ 所有注释检查通过")
    else:
        print(f"\n❌ 发现 {total_violations} 个注释问题")
        sys.exit(1)


if __name__ == "__main__":
    main()