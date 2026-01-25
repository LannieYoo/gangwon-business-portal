---
name: skill-discovery
description: 帮助 Antigravity 发现和使用项目中的 120+ 个特定领域能力。
---

# Skills Library Helper

本项目包含大量特定领域的能力（Skills），原位于 `.skills/` 目录，现已全部迁移至 `.agent/skills/`。

## ⚠️ 路径变更提醒 (Important)

由于迁移，部分旧 Skill 文档中可能仍包含指向 `.skills/` 的引用。
**Antigravity 在执行时必须自动进行路径修正：**

- ❌ 旧路径: `.skills/{skill-name}/...`
- ✅ 新路径: `.agent/skills/{skill-name}/...`

## 能力索引 (Index)

详细的能力关键字映射表请继续参考：`references/keyword_map.md`

## 常用领域速查

所有能力现在都是 Antigravity 的原生能力，可以直接通过名称调用，或者通过以下目录结构查找：

- **.agent/skills/dev-\***: 开发相关 (后端, 前端, 测试, 运维)
- **.agent/skills/ai-\***: AI 模型与 Prompt 工程
- **.agent/skills/finance-\***: 金融与财务
- **.agent/skills/immigration-\***: 移民与签证
- **.agent/skills/housing-\***: 住房与生活

## 如何使用

1. 当用户询问特定主题时，参考 `skills-manager.md` 找到对应的 Skill 名称。
2. 直接通过 Antigravity 的原生机制加载该 Skill (即读取 `.agent/skills/{skill-name}/SKILL.md`)。
3. 如果 Skill 内部引用了脚本或资源，记得应用上述的路径修正规则。
