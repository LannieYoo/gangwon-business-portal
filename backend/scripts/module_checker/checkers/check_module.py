#!/usr/bin/env python3
"""模块规范检查器。"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractModuleSizeChecker,
    run_checker,
)


class ModuleChecker(AbstractModuleSizeChecker):
    """模块规范检查器。"""

    def __init__(self, module_path: str):
        self.module_path = Path(module_path)
        self.src_root = self._find_src_root()
        self.violations = []
        self.current_module = self._get_current_module()

    @property
    def name(self) -> str:
        return "模块规范"

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
        # 检查模块接口数量
        self._check_module_interface_count()

        if not self.violations:
            print(f"[PASS] {self.name}检查通过")
            return 0

        for v in self.violations:
            print(f"[FAIL] {v.file_path}:{v.line_no} {v.message}")
        print(f"[FAIL] 发现 {len(self.violations)} 个{self.name}问题")
        return len(self.violations)

    def _check_module_interface_count(self):
        """检查模块接口文件数量。"""
        # 如果是单个文件，获取其所在模块
        if self.module_path.is_file():
            module_dir = self.module_path.parent
            while module_dir.name != 'modules' and module_dir.parent != module_dir:
                if any(layer in module_dir.name for layer in ['_01_contracts', '_02_entities', '_03_repositories', '_04_use_cases', '_05_controllers', '_06_services']):
                    module_dir = module_dir.parent
                    break
                module_dir = module_dir.parent
        else:
            module_dir = self.module_path

        # 查找 _01_contracts 目录
        contracts_dir = None
        if module_dir.name.endswith('_01_contracts'):
            contracts_dir = module_dir
        else:
            for subdir in module_dir.rglob('*'):
                if subdir.is_dir() and subdir.name == '_01_contracts':
                    contracts_dir = subdir
                    break

        if not contracts_dir or not contracts_dir.exists():
            return

        # 统计接口文件数量
        interface_files = []
        for file_path in contracts_dir.glob('i_*.py'):
            interface_files.append(file_path.name)

        interface_count = len(interface_files)
        max_interfaces = 10

        print(f"检查模块 {module_dir.name}: 接口数量 {interface_count}/{max_interfaces}")

        if interface_count > max_interfaces:
            # 生成建议的子模块名称
            suggestions = self._generate_submodule_suggestions(interface_files, module_dir.name)
            
            # 显示前几个接口文件作为预览
            file_preview = ', '.join(interface_files[:5])
            suffix = '...' if len(interface_files) > 5 else ''
            
            rel_path = str(contracts_dir.relative_to(self.src_root))
            self.add_violation(
                rel_path, 1,
                f"模块 {module_dir.name} 接口过多 ({interface_count} 个)，建议 ≤{max_interfaces} 个，"
                f"考虑拆分为子模块: {suggestions}。"
                f"当前接口: {file_preview}{suffix}",
            )

    def _generate_submodule_suggestions(self, interface_files: list, module_name: str) -> str:
        """根据接口文件名生成子模块建议。"""
        # 分析接口文件名，提取关键词
        keywords = set()
        
        for file_name in interface_files:
            # 移除 i_ 前缀和 .py 后缀
            name = file_name[2:-3]  # i_log_writer.py -> log_writer
            
            # 分割下划线，提取关键词
            parts = name.split('_')
            if len(parts) >= 2:
                # 跳过模块名本身
                filtered_parts = [p for p in parts if p != module_name.lower()]
                if filtered_parts:
                    keywords.add(filtered_parts[0])  # 取第一个关键词
        
        # 生成建议的子模块名称
        if keywords:
            suggestions = [f"{module_name}/{keyword}" for keyword in sorted(keywords)[:4]]
            return ', '.join(suggestions)
        else:
            # 如果无法提取关键词，给出通用建议
            return f"{module_name}/core, {module_name}/storage, {module_name}/query, {module_name}/management"

    def add_violation(self, file_path: str, line_no: int, message: str):
        """添加违规记录。"""
        from checker_framework.d_violation import DViolation
        self.violations.append(DViolation(
            file_path=file_path,
            line_no=line_no,
            message=message,
        ))


if __name__ == "__main__":
    run_checker(ModuleChecker)