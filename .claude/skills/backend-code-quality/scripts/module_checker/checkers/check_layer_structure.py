#!/usr/bin/env python3
"""模块分层结构检查器。"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    run_checker,
)


class LayerStructureChecker(AbstractLayerChecker):
    """模块分层结构检查器。
    
    检查模块是否按照规范的分层目录结构组织：
    - _01_contracts/    # 接口+数据契约
    - _02_dtos/         # API请求/响应
    - _03_abstracts/    # 抽象基类
    - _04_models/       # ORM+Repository
    - _05_impls/        # 实现类
    - _06_services/     # 服务入口
    - _07_router/       # 路由端点+依赖注入
    """

    REQUIRED_LAYERS = [
        "_01_contracts",
        "_02_dtos", 
        "_03_abstracts",
        "_04_models",
        "_05_impls",
        "_06_services",
        "_07_router"
    ]

    LAYER_DESCRIPTIONS = {
        "_01_contracts": "接口+数据契约 (无依赖，最底层)",
        "_02_dtos": "API请求/响应 (无内部依赖)",
        "_03_abstracts": "抽象基类 (依赖 01)",
        "_04_models": "ORM+Repository (依赖 01)",
        "_05_impls": "实现类 (依赖 01, 03)",
        "_06_services": "服务入口 (依赖 01)",
        "_07_router": "路由端点+依赖注入 (依赖 06, 02)"
    }

    @property
    def name(self) -> str:
        return "分层结构"

    @property
    def layer_pattern(self) -> str:
        return ""

    @property
    def file_prefix(self) -> str:
        return ""

    def is_target_file(self, file_path: Path) -> bool:
        """对于分层结构检查，我们需要检查所有 Python 文件来触发模块结构检查。"""
        return file_path.name.endswith('.py') and not file_path.name.startswith('__')

    def check_module_structure(self, module_path: Path):
        """检查模块的分层目录结构。"""
        if not module_path.is_dir():
            self.add_violation(str(module_path), 0, "模块路径不是目录")
            return

        # 检查是否存在必需的分层目录
        existing_layers = []
        legacy_files = []
        
        for item in module_path.iterdir():
            if item.is_dir() and item.name in self.REQUIRED_LAYERS:
                existing_layers.append(item.name)
            elif item.is_file() and item.name.endswith('.py') and item.name != '__init__.py':
                legacy_files.append(item.name)

        # 检查是否所有必需的分层目录都存在
        missing_layers = [layer for layer in self.REQUIRED_LAYERS if layer not in existing_layers]
        
        if missing_layers:
            # 如果缺少分层目录，报告需要创建
            message = f"缺少必需的分层目录: {', '.join(missing_layers)}\n\n"
            message += "需要创建所有标准分层目录:\n"
            
            for layer in self.REQUIRED_LAYERS:
                message += f"  {layer}/ - {self.LAYER_DESCRIPTIONS[layer]}\n"
            
            message += "\n重构步骤 (按开发顺序):\n"
            message += "1. 创建所有分层目录\n"
            message += "2. 按开发顺序逐步提取和重构:\n"
            message += "   ① _01_contracts - 提取接口定义和数据契约\n"
            message += "   ② _02_dtos - 提取API请求/响应模型\n"
            message += "   ③ _03_abstracts - 提取抽象基类\n"
            message += "   ④ _04_models - 提取ORM模型和Repository\n"
            message += "   ⑤ _05_impls - 提取业务逻辑实现\n"
            message += "   ⑥ _06_services - 提取服务入口\n"
            message += "   ⑦ _07_router - 提取路由和依赖注入\n"
            
            self.add_violation(str(module_path), 0, message)
            return
        
        # 如果所有分层目录都存在，但还有旧文件，给出提示但不算错误
        if legacy_files:
            # 这里可以添加一个信息性提示，但不作为错误
            # 因为分层目录已经创建，可以开始逐步迁移
            pass
        
        # 检查目录顺序（开发顺序）
        if existing_layers:
            sorted_layers = sorted(existing_layers)
            if existing_layers != sorted_layers:
                self.add_violation(
                    str(module_path), 0,
                    f"分层目录应按开发顺序命名: {' → '.join(sorted_layers)}"
                )

    def check_file_level(self, tree, file_path: str):
        """文件级检查 - 在这里检查整个模块结构。"""
        # 只在检查第一个文件时执行模块结构检查
        file_path_obj = Path(file_path)
        # 从相对路径构建绝对路径
        if file_path_obj.is_absolute():
            module_path = file_path_obj.parent
        else:
            # 相对路径，需要结合 src_root 来构建完整路径
            full_path = self.src_root / file_path
            module_path = full_path.parent
        
        # 确保我们检查的是主模块目录，不是子目录
        # 如果路径包含分层目录名，向上查找到主模块目录
        for layer in self.REQUIRED_LAYERS:
            if layer in str(module_path):
                # 找到包含分层目录的路径，向上查找主模块目录
                parts = module_path.parts
                for i, part in enumerate(parts):
                    if part == layer:
                        # 主模块目录是分层目录的父目录
                        module_path = Path(*parts[:i])
                        break
                break
            
        if not hasattr(self, '_checked_modules'):
            self._checked_modules = set()
        
        if str(module_path) not in self._checked_modules:
            self._checked_modules.add(str(module_path))
            self.check_module_structure(module_path)

    def check_class(self, node, file_path: str, content: str):
        """检查类定义。"""
        pass


if __name__ == "__main__":
    run_checker(LayerStructureChecker)