"""重复代码检查抽象类。"""
from typing import Dict, List, Set

from .i_duplicate_checker import IDuplicateChecker


class AbstractDuplicateChecker(IDuplicateChecker):
    """重复代码检查抽象类。"""

    def check_duplicate_implementations(self, abstract_name: str, abstract_file: str, abstract_line: int, subclasses: List, abstract_methods: Set[str]):
        """检查多个实现类有相同方法实现时，应提取到抽象类。"""
        if len(subclasses) < 2:
            return

        method_implementations: Dict[str, List] = {}

        for impl_class in subclasses:
            for method_name in impl_class.get('methods', {}):
                if method_name.startswith('_'):
                    continue
                if method_name in abstract_methods:
                    continue

                if method_name not in method_implementations:
                    method_implementations[method_name] = []
                method_implementations[method_name].append(impl_class)

        for method_name, impl_classes in method_implementations.items():
            if len(impl_classes) >= 2:
                impl_names = [c.get('name', 'unknown') for c in impl_classes]
                self.add_violation(
                    abstract_file, abstract_line,
                    f"方法 '{method_name}' 在多个实现类中重复 ({', '.join(impl_names)})，应提取到抽象类 {abstract_name}",
                )
