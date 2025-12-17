# 前端自动化测试

## 测试架构原则

本项目遵循资深前端测试工程师的最佳实践，采用严格的测试规则确保测试质量和可维护性。

### 核心规则

#### 1. 测试结构规则
- ✅ **单一职责**: 每个 test 只验证一个明确业务行为
- ✅ **独立运行**: 所有 test 必须独立可运行、可重试
- ✅ **模块拆分**: 禁止单个 test 覆盖多个功能模块

#### 2. 断言规则
- ✅ **明确断言**: 禁止使用 `if (isVisible)` 跳过断言
- ✅ **状态验证**: 断言应验证状态变化或业务结果
- ✅ **必要断言**: 所有关键操作后必须有明确 expect 断言

#### 3. 等待与稳定性规则
- ✅ **事件驱动**: 禁止使用 `waitForTimeout`
- ✅ **智能等待**: 必须使用 `expect().toBeVisible()` / `toHaveText()` / `toHaveURL()` 等
- ✅ **状态同步**: 等待真实的状态变化而非固定时间

#### 4. Selector 规则
- ✅ **语义化选择器**: 优先使用 `getByRole` / `getByTestId`
- ✅ **避免脆弱选择器**: 禁止使用 `text=xxx` 作为唯一 selector
- ✅ **可访问性**: 选择器应符合可访问性标准

## 测试模块

### 管理员模块测试
每个模块按功能拆分为多个独立的 test.describe 块：

- **`dashboard.spec.js`** - 仪表盘模块
  - 页面加载测试
  - 统计卡片功能测试
  - 筛选功能测试
  - 图表功能测试
  - 数据导出测试
  - 响应式布局测试
  - 性能测试
  - 可访问性测试

- **`members.spec.js`** - 企业管理模块
  - 页面加载测试
  - 搜索功能测试
  - 筛选功能测试
  - 企业详情查看测试
  - 企业审批功能测试
  - Nice D&B 搜索测试
  - 数据导出测试
  - 分页功能测试
  - 表格排序测试
  - 批量操作测试

- **`content-management.spec.js`** - 内容管理模块
  - 页面导航测试
  - 横幅管理功能测试
  - 公告管理功能测试
  - FAQ管理功能测试
  - 系统介绍管理测试
  - 响应式布局测试
  - 性能测试
  - 可访问性测试

## 运行测试

### 运行单个模块测试
```bash
# 仪表盘测试
npx playwright test tests/admin/dashboard.spec.js

# 企业管理测试
npx playwright test tests/admin/members.spec.js

# 内容管理测试
npx playwright test tests/admin/content-management.spec.js
```

### 运行特定功能测试
```bash
# 只运行搜索功能测试
npx playwright test tests/admin/members.spec.js -g "搜索功能"

# 只运行响应式布局测试
npx playwright test tests/admin/ -g "响应式布局"
```

### 调试模式运行
```bash
# 显示浏览器运行测试
npx playwright test tests/admin/dashboard.spec.js --headed

# 调试模式（逐步执行）
npx playwright test tests/admin/dashboard.spec.js --debug
```

### 生成测试报告
```bash
# 运行测试并生成HTML报告
npx playwright test --reporter=html

# 查看测试报告
npx playwright show-report
```

## 测试覆盖目标

### 功能覆盖
- ✅ **成功路径**: 正常业务流程验证
- ✅ **失败路径**: 表单验证、错误处理
- ✅ **边界条件**: 空数据、极限值测试
- ✅ **用户交互**: 点击、输入、选择、拖拽

### 质量覆盖
- ✅ **性能测试**: 页面加载时间、交互响应时间
- ✅ **响应式测试**: 多种屏幕尺寸适配
- ✅ **可访问性测试**: WCAG 2.1 标准符合性
- ✅ **跨浏览器测试**: Chrome、Firefox、Safari

### 数据覆盖
- ✅ **数据完整性**: 数据格式、数值范围验证
- ✅ **状态一致性**: UI状态与数据状态同步
- ✅ **导出功能**: 文件格式、内容正确性

## 测试最佳实践

### 1. 测试命名
```javascript
// ✅ 好的测试名称 - 描述业务行为
test('应该能够按企业名称搜索', async ({ page }) => {

// ❌ 不好的测试名称 - 描述技术实现
test('测试搜索输入框', async ({ page }) => {
```

### 2. 断言方式
```javascript
// ✅ 明确的断言 - 验证具体状态
await expect(page.getByRole('button', { name: '保存' })).toBeEnabled();

// ❌ 条件性断言 - 可能跳过验证
if (await saveButton.isVisible()) {
  expect(await saveButton.isEnabled()).toBeTruthy();
}
```

### 3. 等待方式
```javascript
// ✅ 事件驱动等待 - 等待真实状态
await expect(page.getByTestId('search-results')).toBeVisible();

// ❌ 固定时间等待 - 不可靠
await page.waitForTimeout(1000);
```

### 4. 选择器使用
```javascript
// ✅ 语义化选择器 - 稳定可靠
await page.getByRole('button', { name: '提交' }).click();
await page.getByTestId('user-profile').click();

// ❌ 脆弱选择器 - 容易失效
await page.locator('text=提交').click();
await page.locator('.btn-primary').click();
```

## 测试数据管理

### 测试账号
- **管理员账号**: `admin@k-talk.kr` / `password123`
- **测试企业**: 通过后端测试数据生成脚本创建

### 测试环境
- **前端服务**: `http://localhost:3000`
- **后端API**: `http://localhost:8000`
- **数据库**: PostgreSQL (测试数据库)

## 故障排除

### 常见问题
1. **测试超时**: 检查网络连接和服务状态
2. **元素未找到**: 验证选择器和页面状态
3. **断言失败**: 检查预期结果和实际状态
4. **登录失败**: 确认测试账号和密码正确

### 调试技巧
```bash
# 查看测试执行过程
npx playwright test --headed --slowMo=1000

# 生成测试代码
npx playwright codegen localhost:3000

# 查看测试追踪
npx playwright test --trace=on
```