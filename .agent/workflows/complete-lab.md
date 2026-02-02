---
description: Complete course lab/assignment from start to submission - universal workflow for all courses
---

# 📚 课程作业完成工作流 (Universal Lab Workflow)

这是一个通用的课程作业完成工作流，适用于所有课程的 Lab 和 Assignment。

## 🎯 使用方式

```
/complete-lab [课程] [作业编号]

示例:
/complete-lab ml lab2
/complete-lab nlp assignment1
/complete-lab mv lab3
```

## 📋 完整流程概览

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: 抓取 (Scrape)                                       │
│   ↓ brightspace_scraper skill                               │
├─────────────────────────────────────────────────────────────┤
│ Phase 2: 转换 (Convert)                                      │
│   ↓ docx_to_md, pdf_processing skills                       │
├─────────────────────────────────────────────────────────────┤
│ Phase 3: 理解 (Understand)                                   │
│   ↓ note_taking, ai_learning-* skills                       │
├─────────────────────────────────────────────────────────────┤
│ Phase 4: 开发 (Develop)                                      │
│   ↓ code_generation, notebook_conversion skills             │
├─────────────────────────────────────────────────────────────┤
│ Phase 5: 验证 (Verify)                                       │
│   ↓ code_consistency skill                                  │
├─────────────────────────────────────────────────────────────┤
│ Phase 6: 文档 (Document)                                     │
│   ↓ code_screenshot, assignment_document skills             │
├─────────────────────────────────────────────────────────────┤
│ Phase 7: 检查 (Check)                                        │
│   ↓ lab_submission skill                                    │
├─────────────────────────────────────────────────────────────┤
│ Phase 8: 提交 (Submit)                                       │
│   ↓ git skill, push to Brightspace                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 抓取课程材料 📥

**Skill**: `learning-brightspace_scraper`

### 步骤

1. 使用浏览器登录 Brightspace
2. 抓取指定课程的作业材料
3. 保存到 `courses/[course]/labs/` 目录

### 命令

```
读取 skill: .shared/skills/learning-brightspace_scraper/SKILL.md
执行抓取并保存材料
```

### 输出

- `courses/[course]/labs/Lab[N]_*.pdf` (原始文件)
- `courses/[course]/labs/Lab[N]_*.docx` (如有)

---

## Phase 2: 格式转换 📄

**Skills**: `dev-docx_to_md`, `dev-pdf_processing`

### 步骤

1. 将 PDF/DOCX 转换为 Markdown
2. 提取图片和表格
3. 格式化文档结构

### 命令

// turbo

```
读取 skill: .shared/skills/dev-pdf_processing/SKILL.md
转换 PDF 到 Markdown
格式化 Markdown 结构
```

### 输出

- `courses/[course]/labs/Lab[N]_*.md` (Markdown 格式)

---

## Phase 3: 理解需求 🧠

**Skills**: `learning-note_taking`, `ai_learning-[ml/nlp/mv/...]`

### 步骤

1. 读取课程特定的学习助手 skill
2. 分析作业要求
3. 添加学习笔记到 Markdown

### 命令

```
读取 skill: .shared/skills/ai_learning-[course]/SKILL.md
读取 skill: .shared/skills/learning-note_taking/SKILL.md
为每个步骤添加中文笔记
```

### 输出

- `courses/[course]/labs/Lab[N]_*.md` (带笔记版本)

---

## Phase 4: 代码开发 💻

**Skills**: `learning-code_generation`, `learning-notebook_conversion`

### 步骤

1. 根据作业要求生成 Python 代码
2. 为每个步骤添加双语注释
3. 转换为 Jupyter Notebook

### 命令

// turbo

```
读取 skill: .shared/skills/learning-code_generation/SKILL.md
生成 Python 代码 (courses/[course]/labs/lab[n]_*.py)
读取 skill: .shared/skills/learning-notebook_conversion/SKILL.md
转换为 Notebook (courses/[course]/labs/lab[n]_*.ipynb)
```

### 输出

- `courses/[course]/labs/lab[n]_*.py`
- `courses/[course]/labs/lab[n]_*.ipynb`

### 代码模板规范

Python 文件应使用以下格式的 docstring（不需要 print header）：

```python
"""
CST8506 Lab 2: Support Vector Machines
Author: Peng Wang
Student Number: 041107730

[实验描述]
"""

import os
# ... 其他 imports
```

---

## Phase 5: 运行验证 ✅

**Skill**: `learning-code_consistency`

### 步骤

1. 运行代码验证无错误
2. 检查 .py 和 .ipynb 一致性
3. 验证输出符合作业要求

### 命令

// turbo

```bash
cd courses/[course]/labs
uv run python lab[n]_*.py
```

```
读取 skill: .shared/skills/learning-code_consistency/SKILL.md
验证 .py 和 .ipynb 内容一致
```

### 检查项

- [ ] 代码无错误运行
- [ ] 所有步骤都有输出
- [ ] 图表正确保存到 `lab[n]_images/` 目录
- [ ] .py 和 .ipynb 一致

### 图表保存规范

代码中的图表应：

- 保存到 `lab[n]_images/` 目录（标明是哪个实验）
- 使用 `plt.savefig()` 保存
- 使用 `plt.close()` 替代 `plt.show()` 避免弹窗
- 示例：

```python
OUTPUT_DIR = 'lab2_images'  # lab[n]_images 格式
os.makedirs(OUTPUT_DIR, exist_ok=True)
plt.savefig(os.path.join(OUTPUT_DIR, 'plot_name.png'), dpi=150, bbox_inches='tight')
plt.close()
```

### 输出文件验证

**重要：截图前必须先验证输出内容**

1. 先运行代码，将输出保存到文件：

```bash
uv run python lab[n]_*.py > lab[n]_images/output.txt 2>&1
```

2. 检查输出文件内容无误：

```bash
cat lab[n]_images/output.txt
```

3. 确认无误后再进行截图

---

## Phase 6: 文档生成 📝

**Skills**: `learning-code_screenshot`, `learning-assignment_document`, `learning-md_to_docx`

### 步骤

1. 生成代码和输出截图
2. 填充答题模板
3. 转换为 Word 文档

### 命令

```
读取 skill: .shared/skills/learning-code_screenshot/SKILL.md
生成每个步骤的截图

读取 skill: .shared/skills/learning-assignment_document/SKILL.md
填充答题模板

读取 skill: .shared/skills/learning-md_to_docx/SKILL.md
转换为 Word 文档
```

### 输出

- `courses/[course]/labs/lab[n]_images/` (图表和截图目录)
- `courses/[course]/labs/Lab[N]_Answer.md` (答题文档 Markdown)
- `courses/[course]/labs/Lab[N]_<firstname>.docx` (提交用 Word)

---

## Phase 7: 提交检查 🔍

**Skill**: `learning-lab_submission`

### 步骤

1. 检查所有提交文件是否完整
2. 验证文件命名规范
3. 检查格式要求

### 命令

```
读取 skill: .shared/skills/learning-lab_submission/SKILL.md
执行提交前检查
```

### 检查清单

- [ ] `.ipynb` 文件存在且可运行
- [ ] `.docx` 答题文档完整
- [ ] 每个步骤都有截图
- [ ] 每个步骤都有解释说明
- [ ] 文件命名符合要求
- [ ] 没有压缩文件 (如要求)

---

## Phase 8: 保存提交 📤

**Skill**: `dev-git`

### 步骤

1. Git 提交本地更改
2. 推送到远程仓库
3. 上传到 Brightspace (手动)

### 命令

// turbo

```bash
git add courses/[course]/labs/
git commit -m "Complete [course] Lab[N]"
git push
```

### 最终提交到 Brightspace

- 上传 `.ipynb` 文件
- 上传 `.docx` 答题文档

---

## 🗂️ 目录结构示例

```
courses/
└── ml/
    └── labs/
        ├── Lab2_SVM.md              # 作业说明 (Markdown)
        ├── Lab2AnswerTemplate.md    # 答题模板
        ├── lab2_svm.py              # Python 代码
        ├── lab2_svm.ipynb           # Jupyter Notebook
        ├── Lab2_Answer.md           # 答题文档 (Markdown)
        ├── Lab2_John.docx           # 提交用 Word
        └── lab2_images/             # Lab2 图表和截图目录
            ├── pca_svm_plots.png
            ├── lda_svm_plots.png
            └── ...
```

---

## 💡 快捷子命令

| 命令                                | 说明           | 从哪个 Phase 开始 |
| ----------------------------------- | -------------- | ----------------- |
| `/complete-lab ml lab2`             | 完整流程       | Phase 1           |
| `/complete-lab ml lab2 --from=code` | 从代码开发开始 | Phase 4           |
| `/complete-lab ml lab2 --from=doc`  | 从文档生成开始 | Phase 6           |
| `/complete-lab ml lab2 --check`     | 只运行检查     | Phase 7           |

---

## 📊 支持的课程

| 课程代码 | 课程名称                    | 对应 Skill        |
| -------- | --------------------------- | ----------------- |
| `ml`     | Machine Learning            | `ai_learning-ml`  |
| `nlp`    | Natural Language Processing | `ai_learning-nlp` |
| `mv`     | Machine Vision              | `ai_learning-mv`  |
| `cv`     | Computer Vision             | `ai_learning-cv`  |
| `dl`     | Deep Learning               | `ai_learning-dl`  |
| `rl`     | Reinforcement Learning      | `ai_learning-rl`  |
