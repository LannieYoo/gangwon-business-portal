"""模块大小检查抽象类。"""
import os

from .i_module_size_checker import IModuleSizeChecker


class AbstractModuleSizeChecker(IModuleSizeChecker):
    """模块大小检查抽象类。"""

    def check_module_interface_count(self, file_path: str, max_interfaces: int) -> None:
        """检查模块接口数量不超过限制。"""
        # 获取 _01_contracts 目录路径
        contracts_dir = os.path.dirname(file_path)
        
        # 确保是在 _01_contracts 目录中
        if not contracts_dir.endswith("_01_contracts"):
            return
            
        # 避免重复检查同一个模块
        if hasattr(self, '_checked_modules'):
            if contracts_dir in self._checked_modules:
                return
        else:
            self._checked_modules = set()
        
        self._checked_modules.add(contracts_dir)
            
        # 获取模块路径（上一级目录）
        module_path = os.path.dirname(contracts_dir)
        module_name = os.path.basename(module_path)
        
        # 统计接口文件数量
        interface_files = []
        interface_count = 0
        
        try:
            for file_name in os.listdir(contracts_dir):
                if file_name.startswith("i_") and file_name.endswith(".py"):
                    interface_files.append(file_name)
                    interface_count += 1
        except OSError:
            return
        
        # 调试输出
        # print(f"DEBUG: 检查模块 {module_name}, 接口数量: {interface_count}, 限制: {max_interfaces}")
        
        if interface_count > max_interfaces:
            # 生成建议的子模块名称
            suggestions = self._generate_submodule_suggestions(interface_files, module_name)
            
            # 显示前几个接口文件作为预览
            file_preview = ', '.join(interface_files[:5])
            suffix = '...' if len(interface_files) > 5 else ''
            
            self.add_violation(
                file_path, 1,
                f"模块 {module_name} 接口过多 ({interface_count} 个)，建议 ≤{max_interfaces} 个，"
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