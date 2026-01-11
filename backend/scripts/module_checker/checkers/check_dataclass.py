#!/usr/bin/env python3
"""Dataclass 规范检查器。"""
import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from checker_framework import (
    AbstractLayerChecker,
    AbstractDataclassChecker,
    run_checker,
)


class DataclassChecker(
    AbstractLayerChecker,
    AbstractDataclassChecker,
):
    """Dataclass 规范检查器。"""

    def __init__(self, module_path: str):
        super().__init__(module_path)
        # 初始化 dataclass 检查器的状态
        self._organization_checked = False
        self._organization_valid = False
        self._all_classes_checked = False

    @property
    def name(self) -> str:
        return "Dataclass 规范"

    @property
    def layer_pattern(self) -> str:
        return "_01_contracts"

    @property
    def file_prefix(self) -> str:
        return "d_"

    def check_file_level(self, tree: ast.AST, file_path: str):
        """文件级检查。"""
        # 1. 文件组织检查（只在第一个文件时检查）
        if not hasattr(self, '_checked_organization'):
            self.check_dataclass_file_organization(str(self.module_path))
            self._checked_organization = True
            
            # 如果文件组织有问题，立即停止
            if not self._organization_valid:
                return False  # 返回 False 表示应该停止检查
        
        # 2. 核心检查：防止语义重复的类型定义
        self.check_no_semantic_duplicate_classes(tree, file_path)
        
        return True  # 返回 True 表示可以继续检查

    def check_class(self, node: ast.ClassDef, file_path: str, content: str):
        """检查类定义。"""
        # 只检查 D 开头的类
        if node.name.startswith('D'):
            self.check_dataclass_structure(node, file_path)
            # 如果有违规，立即停止
            if self.has_violations():
                return False  # 返回 False 表示应该停止检查
        return True  # 返回 True 表示可以继续检查

    def check_final_usage(self):
        """在所有类检查完成后，检查 dataclass 组合模式和使用情况。"""
        if not self._all_classes_checked:
            self._all_classes_checked = True
            # 只有在没有其他违规的情况下才检查组合模式和使用情况
            if not self.has_violations():
                # 优先级 6: 组合模式检查 - 临时跳过
                # composition_result = self.check_dataclass_composition(str(self.module_path))
                # if not composition_result:
                #     return False
                
                # 优先级 7: 使用情况检查 - 临时跳过
                # usage_result = self.check_dataclass_usage(str(self.module_path))
                # if not usage_result:
                #     return False
                pass
        return True

    def check_no_semantic_duplicate_classes(self, tree: ast.AST, file_path: str):
        """检查语义重复的类定义 - 核心防护措施。"""
        # 收集所有 dataclass 的字段信息
        classes_info = {}
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef) and self._is_dataclass(node):
                fields = self._extract_class_fields(node)
                if fields:
                    classes_info[node.name] = {
                        'fields': fields,
                        'line': node.lineno
                    }
        
        # 检查语义重复
        self._detect_semantic_duplicates(classes_info, file_path)

    def _is_dataclass(self, node: ast.ClassDef) -> bool:
        """检查是否为 dataclass。"""
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name) and decorator.id == 'dataclass':
                return True
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'dataclass':
                    return True
        return False

    def _extract_class_fields(self, node: ast.ClassDef) -> dict:
        """提取类的字段信息。"""
        fields = {}
        for item in node.body:
            if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                field_name = item.target.id
                type_name = self._extract_type_name(item.annotation)
                fields[field_name] = type_name
        return fields

    def _extract_type_name(self, annotation: ast.AST) -> str:
        """提取类型名称。"""
        if isinstance(annotation, ast.Name):
            return annotation.id
        elif isinstance(annotation, ast.Attribute):
            return annotation.attr
        elif isinstance(annotation, ast.Subscript):
            return self._extract_type_name(annotation.value)
        return "Unknown"

    def _detect_semantic_duplicates(self, classes_info: dict, file_path: str):
        """检测语义重复的类。"""
        # 定义关键字段模式 - 如果两个类包含相同的关键字段组合，认为语义重复
        key_patterns = {
            'log_id_pattern': ['log_id'],
            'user_context_pattern': ['user_id', 'session_id'],
            'request_context_pattern': ['trace_id', 'request_id'],
            'log_detail_pattern': ['log_id', 'message', 'level'],
        }
        
        # 按模式分组类
        pattern_groups = {}
        for class_name, class_info in classes_info.items():
            fields = set(class_info['fields'].keys())
            
            for pattern_name, key_fields in key_patterns.items():
                if all(field in fields for field in key_fields):
                    if pattern_name not in pattern_groups:
                        pattern_groups[pattern_name] = []
                    pattern_groups[pattern_name].append((class_name, class_info))
        
        # 检查每个模式组是否有重复
        for pattern_name, classes in pattern_groups.items():
            if len(classes) > 1:
                # 进一步检查字段相似度
                duplicates = self._find_field_duplicates(classes)
                if duplicates:
                    self._report_semantic_duplicate(duplicates, pattern_name, file_path)

    def _find_field_duplicates(self, classes: list) -> list:
        """找出字段高度相似的类。"""
        duplicates = []
        
        for i in range(len(classes)):
            for j in range(i + 1, len(classes)):
                class1_name, class1_info = classes[i]
                class2_name, class2_info = classes[j]
                
                fields1 = set(class1_info['fields'].keys())
                fields2 = set(class2_info['fields'].keys())
                
                # 计算字段重叠度
                overlap = len(fields1 & fields2)
                total_unique = len(fields1 | fields2)
                
                # 如果重叠度超过 70%，认为是重复
                if total_unique > 0 and overlap / total_unique > 0.7:
                    duplicates.append((classes[i], classes[j]))
        
        return duplicates

    def _report_semantic_duplicate(self, duplicates: list, pattern_name: str, file_path: str):
        """报告语义重复问题。"""
        for (class1_name, class1_info), (class2_name, class2_info) in duplicates:
            fields1 = set(class1_info['fields'].keys())
            fields2 = set(class2_info['fields'].keys())
            common_fields = fields1 & fields2
            
            self.add_violation(
                file_path, class1_info['line'],
                f"发现语义重复的类定义: {class1_name} 和 {class2_name}\n"
                f"  共同字段: {', '.join(sorted(common_fields))}\n"
                f"  模式: {pattern_name}\n"
                f"  问题: 这将导致 Service 层需要无意义的类型转换\n"
                f"  建议: 统一使用 {class1_name}，删除 {class2_name}，或重新设计接口层次"
            )


if __name__ == "__main__":
    run_checker(DataclassChecker)