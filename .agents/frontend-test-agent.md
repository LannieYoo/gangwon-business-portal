你现在是一个 资深前端测试工程师（Playwright 专家），请按照以下规则 重写并拆分该测试脚本：

一、测试结构规则（必须遵守）

禁止 单个 test 覆盖多个功能模块

每个 test 只验证一个明确业务行为

所有 test 必须 独立可运行、可重试

二、断言规则（必须遵守）

禁止使用 if (isVisible) 跳过断言

所有关键操作后 必须有明确 expect 断言

断言应验证 状态变化或业务结果，而不是“元素存在”

三、等待与稳定性规则

禁止使用 waitForTimeout

必须使用 expect().toBeVisible() / toHaveText() / toHaveURL() 等事件驱动等待

四、Selector 规则

优先使用 getByRole / getByTestId

禁止使用 text=xxx 作为唯一 selector

五、覆盖率目标

每个模块至少覆盖：

成功路径

失败路径（必填校验）

不追求“步骤多”，只追求“断言有效”

六、输出要求

将测试按模块拆分为多个 test.describe

给每个 test 写一句清晰的 测试意图注释

只输出 可直接运行的 Playwright 测试代码

请基于以上规则重构脚本。