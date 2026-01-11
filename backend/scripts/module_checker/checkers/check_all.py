#!/usr/bin/env python3
"""模块完整检查器 - 按顺序执行所有检查，前一个失败则停止。"""
import sys
import subprocess
from pathlib import Path

CHECKERS = [
    # 1. 基础结构检查（必须最先）
    ("check_layer_structure.py", "分层结构"),
    ("check_naming.py", "文件命名"),
    ("check_layer_dependency.py", "层级依赖"),
    ("check_imports.py", "导入规范"),
    ("check_exports.py", "导出规范"),
    ("check_functions.py", "函数规范"),
    
    # 2. 契约层（接口定义 - 被所有层依赖）
    ("check_dataclass.py", "Dataclass (d_*)"),
    ("check_enum.py", "Enum (e_*)"),
    ("check_interface.py", "Interface (i_*)"),
    
    # 3. 数据层（相对独立，Model 优先）
    ("check_model.py", "Model"),
    ("check_dto.py", "DTO"),
    
    # 4. Outside-In 开发顺序（按实际开发顺序检查）
    ("check_router.py", "Router"),         # 最先开发 - API 定义
    ("check_service.py", "Service"),       # 基于 Router 需求开发
    ("check_repository.py", "Repository"), # 基于 Service 需求开发 - 数据访问层
    ("check_impl.py", "Impl"),             # 基于 Service 需求开发 - 业务逻辑层
    ("check_abstract.py", "Abstract"),     # 基于 Impl 重复代码
    ("check_deps.py", "Deps"),             # 最后 - 依赖注入配置
]


def run_checker(checker_path: Path, module_path: str) -> tuple:
    """运行单个检查器。"""
    import os
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    result = subprocess.run(
        [sys.executable, str(checker_path), module_path],
        capture_output=True,
        text=True,
        env=env,
        encoding='utf-8',
        errors='replace',
    )
    return result.returncode, result.stdout, result.stderr


def main():
    if len(sys.argv) < 2:
        print("用法: python check_all.py <module_path>")
        print("示例: python check_all.py backend/src/common/modules/logger")
        sys.exit(1)

    module_path = sys.argv[1]

    if not Path(module_path).exists():
        print(f"[FAIL] 路径不存在: {module_path}")
        sys.exit(1)

    checkers_dir = Path(__file__).parent

    print(f"检查模块: {module_path}")
    print("=" * 60)

    for checker_file, checker_name in CHECKERS:
        checker_path = checkers_dir / checker_file
        if not checker_path.exists():
            print(f"[SKIP] {checker_name}: 检查器不存在")
            continue

        returncode, stdout, stderr = run_checker(checker_path, module_path)

        if returncode == 0:
            print(f"[PASS] {checker_name}")
        else:
            print(f"[FAIL] {checker_name}")
            output = stdout.strip() or stderr.strip()
            if output:
                print(output)
            print("=" * 60)
            print(f"[STOP] 检查失败，请立即修复上述问题！")
            sys.exit(1)

    print("=" * 60)
    print(f"[PASS] 所有检查通过")
    sys.exit(0)


if __name__ == "__main__":
    main()
