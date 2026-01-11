#!/usr/bin/env python3
"""豁免规则数据契约。"""
from dataclasses import dataclass
from typing import Set


@dataclass(frozen=True)
class DExemptionRule:
    """豁免规则数据契约。"""
    
    file_prefixes: Set[str]
    standalone_functions: Set[str]
    exempt_decorators: Set[str]
    allow_dunder_methods: bool
    static_method_exempt_prefixes: Set[str]

    @classmethod
    def from_params(
        cls,
        file_prefixes: Set[str],
        standalone_functions: Set[str],
        exempt_decorators: Set[str],
        allow_dunder_methods: bool,
        static_method_exempt_prefixes: Set[str],
    ) -> "DExemptionRule":
        """从参数创建豁免规则。"""
        return cls(
            file_prefixes=file_prefixes,
            standalone_functions=standalone_functions,
            exempt_decorators=exempt_decorators,
            allow_dunder_methods=allow_dunder_methods,
            static_method_exempt_prefixes=static_method_exempt_prefixes,
        )