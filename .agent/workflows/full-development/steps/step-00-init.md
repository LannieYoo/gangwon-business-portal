# Step 0: 初始化工作流

## 目标
初始化或恢复开发工作流状态。

## 执行步骤

### 1. 检查状态文件

检查项目根目录是否存在 `.dev-state.yaml`：

```
if exists(.dev-state.yaml):
    加载状态文件
    显示当前进度
    询问：继续当前阶段 / 跳过 / 重置
else:
    创建新的状态文件（从 state-template.yaml 复制）
    询问项目名称
    从 Phase 1 开始
```

### 2. 显示进度

```
┌─────────────────────────────────────────────────┐
│           Full Development Workflow             │
├─────────────────────────────────────────────────┤
│ 项目: {project_name}                            │
│ 开始时间: {started_at}                          │
│ 当前阶段: {current_phase}/10                    │
├─────────────────────────────────────────────────┤
│ [✓] 1. 需求分析      - 已完成                   │
│ [✓] 2. 产品需求文档  - 已完成                   │
│ [→] 3. 系统架构      - 进行中                   │
│ [ ] 4. 任务分解      - 待开始                   │
│ [ ] 5. 数据库设计    - 待开始                   │
│ [ ] 6. 后端开发      - 待开始                   │
│ [ ] 7. 前端开发      - 待开始                   │
│ [ ] 8. 测试          - 待开始                   │
│ [ ] 9. 代码审查      - 待开始                   │
│ [ ] 10. 部署         - 待开始                   │
└─────────────────────────────────────────────────┘
```

### 3. 自动跳过检查

对于每个阶段，执行跳过检查：

```python
def should_skip(phase):
    # 1. 已标记完成
    if phase.status == 'completed':
        return True

    # 2. 产出物检查
    for check in phase.checks:
        if check.type == 'file_exists':
            if exists(check.path) and not empty(check.path):
                return True
        if check.type == 'script':
            if run_script(check.path) == 0:
                return True

    return False
```

### 4. 确定下一阶段

```python
def get_next_phase():
    for phase in phases:
        if phase.status == 'pending':
            # 检查依赖
            deps_met = all(
                phases[dep].status == 'completed'
                for dep in phase.depends_on
            )
            if deps_met and not should_skip(phase):
                return phase
    return None
```

### 5. 用户选项

显示菜单：

```
[C] 继续 - 执行下一阶段
[S] 跳过 - 跳过当前阶段
[G] 跳转 - 跳转到指定阶段
[R] 重置 - 重新开始
[Q] 退出 - 保存并退出
```

---

## 完成条件

- 状态文件已加载/创建
- 用户已选择操作
- 下一阶段已确定

## 下一步

根据用户选择：
- [C] → 加载对应阶段的 step 文件
- [S] → 标记跳过，回到此步骤
- [G] → 更新 current_phase，回到此步骤
- [R] → 删除状态文件，重新初始化
- [Q] → 保存状态，结束工作流
