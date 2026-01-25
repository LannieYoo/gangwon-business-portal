# Code Review

对未提交更改的全面安全和质量审查：

1. 获取更改的文件: `git diff --name-only HEAD`

2. 对每个更改的文件，检查：

**安全问题 (CRITICAL - 必须修复):**
- 硬编码凭证、API keys、tokens
- SQL 注入漏洞
- XSS 漏洞
- 缺少输入验证
- 不安全的依赖
- 路径遍历风险
- 未转义的用户输入
- 敏感数据记录在 console

**代码质量 (HIGH - 应该修复):**
- 函数 > 50 行
- 文件 > 800 行
- 嵌套深度 > 4 层
- 缺少错误处理
- console.log 语句
- TODO/FIXME 注释
- 公共 API 缺少 JSDoc

**React 特定 (HIGH):**
- 使用默认导出而不是命名导出
- 列表渲染缺少 key prop
- 使用 props 对象而不是解构
- useEffect/useCallback/useMemo 缺少依赖
- 不必要的重新渲染

**i18n 问题 (HIGH):**
- 硬编码的文本字符串
- 缺少翻译键
- ko.json 和 zh.json 键不一致

**最佳实践 (MEDIUM):**
- 直接修改状态（使用不可变模式）
- 代码/注释中使用 emoji
- 新代码缺少测试
- 可访问性问题（a11y）

3. 生成报告，包含：
   - 严重性: CRITICAL, HIGH, MEDIUM, LOW
   - 文件位置和行号
   - 问题描述
   - 建议的修复

4. 如果发现 CRITICAL 或 HIGH 问题，阻止提交

永远不要批准有安全漏洞的代码！
