---
name: dev-verification_loop
description: 验证循环专家。Use when (1) completing a feature, (2) before PR, (3) after refactoring,  (4) ensuring quality gates pass.
---

# 验证循环 Skill

Claude Code 会话的综合验证系统。

## 触发场景

- 完成功能或重大代码更改后
- 创建 PR 之前
- 确保质量门禁通过时
- 重构后

## 验证阶段

### 阶段 1: 构建验证

```bash
# Python - 检查是否能构建
uv run python -m py_compile app/main.py

# TypeScript - 检查是否能构建
npm run build 2>&1 | tail -20
```

如果构建失败，**停止**并修复后再继续。

### 阶段 2: 类型检查

```bash
# Python 项目
uv run mypy app/ 2>&1 | head -30

# TypeScript 项目
npx tsc --noEmit 2>&1 | head -30
```

报告所有类型错误。修复关键错误后再继续。

### 阶段 3: Lint 检查

```bash
# Python
uv run ruff check . 2>&1 | head -30

# TypeScript
npm run lint 2>&1 | head -30
```

### 阶段 4: 测试套件

```bash
# Python - 带覆盖率运行测试
uv run pytest tests/ --cov=app 2>&1 | tail -50

# TypeScript - 带覆盖率运行测试
npm run test -- --coverage 2>&1 | tail -50
```

报告：

- 总测试数: X
- 通过: X
- 失败: X
- 覆盖率: X%

**目标: 80% 最低覆盖率**

### 阶段 5: 安全扫描

```bash
# 检查硬编码密钥
grep -rn "sk-" --include="*.py" --include="*.ts" . 2>/dev/null | head -10
grep -rn "api_key\s*=" --include="*.py" --include="*.ts" . 2>/dev/null | head -10

# 检查 console.log/print
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
grep -rn "print(" --include="*.py" app/ 2>/dev/null | head -10
```

### 阶段 6: Diff 审查

```bash
# 显示更改内容
git diff --stat
git diff HEAD~1 --name-only
```

审查每个更改的文件：

- 意外的更改
- 缺失的错误处理
- 潜在的边界情况

## 输出格式

运行所有阶段后，生成验证报告：

```
验证报告
==================

构建:      [通过/失败]
类型:      [通过/失败] (X 个错误)
Lint:      [通过/失败] (X 个警告)
测试:      [通过/失败] (X/Y 通过, Z% 覆盖率)
安全:      [通过/失败] (X 个问题)
Diff:      [X 个文件更改]

总体:      [可以/不可以] 提交 PR

需要修复的问题：
1. ...
2. ...
```

## 验证脚本

### Python 项目验证脚本

```python
#!/usr/bin/env python
"""验证脚本 - 运行所有质量检查"""

import subprocess
import sys

def run_command(cmd: str) -> tuple[int, str]:
    """运行命令并返回退出码和输出"""
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True
    )
    return result.returncode, result.stdout + result.stderr

def main():
    checks = {
        "构建": "uv run python -m py_compile app/main.py",
        "类型检查": "uv run mypy app/ --ignore-missing-imports",
        "Lint": "uv run ruff check .",
        "格式化": "uv run ruff format --check .",
        "测试": "uv run pytest tests/ -v --tb=short",
    }

    results = {}
    for name, cmd in checks.items():
        print(f"运行 {name}...")
        code, output = run_command(cmd)
        results[name] = "通过" if code == 0 else "失败"
        if code != 0:
            print(f"  ❌ {name} 失败")
            print(output[:500])
        else:
            print(f"  ✅ {name} 通过")

    print("\n" + "=" * 40)
    print("验证报告")
    print("=" * 40)
    for name, status in results.items():
        symbol = "✅" if status == "通过" else "❌"
        print(f"{symbol} {name}: {status}")

    all_passed = all(s == "通过" for s in results.values())
    print("=" * 40)
    print(f"总体: {'✅ 可以提交 PR' if all_passed else '❌ 需要修复问题'}")

    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
```

### TypeScript 项目验证脚本

```typescript
// scripts/verify.ts
import { execSync } from "child_process";

interface CheckResult {
  name: string;
  status: "pass" | "fail";
  output?: string;
}

function runCommand(cmd: string): { code: number; output: string } {
  try {
    const output = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    return { code: 0, output };
  } catch (error: any) {
    return { code: error.status || 1, output: error.stdout || error.message };
  }
}

function main() {
  const checks: Record<string, string> = {
    构建: "npm run build",
    类型检查: "npx tsc --noEmit",
    Lint: "npm run lint",
    测试: "npm test -- --passWithNoTests",
  };

  const results: CheckResult[] = [];

  for (const [name, cmd] of Object.entries(checks)) {
    console.log(`运行 ${name}...`);
    const { code, output } = runCommand(cmd);
    const status = code === 0 ? "pass" : "fail";
    results.push({ name, status, output });

    if (code !== 0) {
      console.log(`  ❌ ${name} 失败`);
      console.log(output.slice(0, 500));
    } else {
      console.log(`  ✅ ${name} 通过`);
    }
  }

  console.log("\n" + "=".repeat(40));
  console.log("验证报告");
  console.log("=".repeat(40));

  for (const { name, status } of results) {
    const symbol = status === "pass" ? "✅" : "❌";
    console.log(`${symbol} ${name}: ${status === "pass" ? "通过" : "失败"}`);
  }

  const allPassed = results.every((r) => r.status === "pass");
  console.log("=".repeat(40));
  console.log(`总体: ${allPassed ? "✅ 可以提交 PR" : "❌ 需要修复问题"}`);

  process.exit(allPassed ? 0 : 1);
}

main();
```

## 持续模式

对于长时间会话，每 15 分钟或重大更改后运行验证：

```markdown
设置心理检查点：

- 完成每个函数后
- 完成一个组件后
- 移动到下一个任务前

运行: /verify
```

## 与 Hooks 集成

此 skill 与 PostToolUse hooks 互补，但提供更深入的验证。
Hooks 立即捕获问题；此 skill 提供全面审查。

## 快速验证检查清单

在标记任务完成之前：

- [ ] 代码能编译/构建
- [ ] 类型检查通过
- [ ] Lint 检查通过
- [ ] 所有测试通过
- [ ] 覆盖率 >= 80%
- [ ] 无硬编码密钥
- [ ] 无 console.log/print
- [ ] Git diff 已审查
- [ ] 无意外文件更改

## 常用命令速查

### Python

```bash
# 完整验证
uv run ruff format . && uv run ruff check --fix . && uv run mypy app/ && uv run pytest tests/ --cov=app

# 快速验证（无覆盖率）
uv run ruff check . && uv run pytest tests/ -x
```

### TypeScript

```bash
# 完整验证
npm run format && npm run lint && npm run build && npm test

# 快速验证
npm run lint && npm run build
```

---

**记住**：验证循环确保代码质量，使 bug 在到达生产之前被捕获。
