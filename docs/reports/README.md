# 自动生成报告

本目录存放由自动化脚本生成的验证报告。

## 报告类型

| 报告         | 描述                    | 生成命令                                                 |
| ------------ | ----------------------- | -------------------------------------------------------- |
| PRD 验证报告 | 验证 PRD 需求是否已实现 | `node .skills/dev-project_docs/scripts/validate-prd.js`  |
| 文档验证报告 | 检查文档质量和链接      | `node .skills/dev-project_docs/scripts/validate-docs.js` |

## 使用方法

### 生成 PRD 验证报告

```bash
node .skills/dev-project_docs/scripts/validate-prd.js
```

### 生成文档验证报告

```bash
node .skills/dev-project_docs/scripts/validate-docs.js
```

### 批量执行所有脚本

```bash
node .skills/dev-project_docs/scripts/update-all.js
```

## 报告文件

生成的报告将保存在本目录下：

- `prd-validation.md` - PRD 实现状态验证
- `doc-validation.txt` - 文档质量检查结果

---

_最后更新: 2026-01-24_
