"""层检查器抽象基类。"""
import ast
import sys
from abc import abstractmethod
from pathlib import Path
from typing import List

from .d_violation import DViolation
from .i_checker import IChecker
from .i_file_scanner import IFileScanner
from .i_class_checker import IClassChecker


class AbstractLayerChecker(IChecker, IFileScanner, IClassChecker):
    """层检查器抽象基类。"""

    def __init__(self, module_path: str):
        self.module_path = Path(module_path)
        self.src_root = self._find_src_root()
        self.violations: List[DViolation] = []
        self.current_module = self._get_current_module()

    @property
    @abstractmethod
    def name(self) -> str:
        """检查器名称。"""
        pass

    @property
    @abstractmethod
    def layer_pattern(self) -> str:
        """目标层目录模式。"""
        pass

    @property
    @abstractmethod
    def file_prefix(self) -> str:
        """目标文件前缀。"""
        pass

    def _find_src_root(self) -> Path:
        """找到 src 根目录。"""
        current = self.module_path
        while current.parent != current:
            if current.name == 'src':
                return current.parent
            current = current.parent
        return self.module_path.parent

    def _get_current_module(self) -> str:
        """获取当前模块名。"""
        parts = self.module_path.parts
        for i, part in enumerate(parts):
            if part == 'modules' and i + 1 < len(parts):
                return parts[i + 1]
        return ""

    def check(self) -> int:
        """运行检查。"""
        for py_file in self.scan_files():
            should_continue = self._check_file(py_file)
            # 如果检查返回 False，立即停止
            if should_continue is False:
                break

        # 如果所有文件检查都通过，进行最终检查
        if not self.violations and hasattr(self, 'check_final_usage'):
            final_result = self.check_final_usage()
            if final_result is False:
                pass  # 违规已在 check_final_usage 中添加

        if not self.violations:
            print(f"[PASS] {self.name}检查通过")
            return 0

        # 只显示第一个违规（失败即停止）
        if self.violations:
            first_violation = self.violations[0]
            print(f"[FAIL] {first_violation.file_path}:{first_violation.line_no} {first_violation.message}")
            print(f"[STOP] 发现{self.name}问题，请立即修复！")
        
        return len(self.violations)

    def is_target_file(self, file_path: Path) -> bool:
        """判断是否为目标文件。"""
        return (
            self.layer_pattern in str(file_path) and
            file_path.name.startswith(self.file_prefix)
        )

    def scan_files(self) -> List[Path]:
        """扫描目标文件。"""
        files = []
        # 如果是单个文件
        if self.module_path.is_file():
            if self.is_target_file(self.module_path):
                files.append(self.module_path)
            return files
        # 如果是目录
        for py_file in self.module_path.rglob("*.py"):
            if py_file.name.startswith("__"):
                continue
            if self.is_target_file(py_file):
                files.append(py_file)
        return files

    def _check_file(self, file_path: Path):
        """检查单个文件。"""
        try:
            content = file_path.read_text(encoding='utf-8')
            tree = ast.parse(content)
            rel_path = str(file_path.relative_to(self.src_root))

            # 文件级检查
            file_result = self.check_file_level(tree, rel_path)
            if file_result is False:
                return False  # 文件级检查失败，停止

            # 类级检查
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    class_result = self.check_class(node, rel_path, content)
                    if class_result is False:
                        return False  # 类级检查失败，停止
                        
        except SyntaxError:
            pass
            
        return True  # 继续检查

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查，子类可重写。"""
        pass

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录。"""
        self.violations.append(DViolation(
            file_path=file_path,
            line_no=line_no,
            message=message,
        ))

    def has_violations(self) -> bool:
        """检查是否有违规记录。"""
        return len(self.violations) > 0


def run_checker(checker_class):
    """通用检查器运行入口。"""
    if len(sys.argv) < 2:
        print(f"用法: python {sys.argv[0]} <module_path>")
        sys.exit(1)

    module_path = sys.argv[1]

    if not Path(module_path).exists():
        print(f"[FAIL] 路径不存在: {module_path}")
        sys.exit(1)

    checker = checker_class(module_path)
    violations = checker.check()

    sys.exit(1 if violations > 0 else 0)
