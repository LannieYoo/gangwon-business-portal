---
name: document-conversion
description: 文档格式转换工作流（DOCX ↔ Markdown ↔ PDF），支持图片提取和保存。
---

# Document Conversion Skill

项目文档格式转换工作流，用于处理 DOCX、PDF 和 Markdown 格式的相互转换。

## 脚本位置

本 skill 包含的脚本已迁移到：
- `.claude/skills/document-conversion/scripts/docx_to_markdown.py`
- `.claude/skills/document-conversion/scripts/md_to_docx.py`
- `.claude/skills/document-conversion/scripts/pdf_to_markdown_advanced.py`
- `.claude/skills/document-conversion/scripts/ocr_images_to_markdown.py`

> **注意**: 原始 `scripts/` 目录下的这些脚本可以安全删除。

## 可用工具

### 1. DOCX → Markdown

**脚本**: `.claude/skills/document-conversion/scripts/docx_to_markdown.py`

**功能**:
- 提取 DOCX 文档内容转为 Markdown
- 自动提取和保存文档中的图片
- 保持文档结构和格式
- 生成图片目录并更新引用路径

**使用方法**:
```bash
# 基本用法
python .claude/skills/document-conversion/scripts/docx_to_markdown.py <docx_file_path>

# 指定输出目录
python .claude/skills/document-conversion/scripts/docx_to_markdown.py <docx_file_path> <output_dir>

# 示例
python .claude/skills/document-conversion/scripts/docx_to_markdown.py docs/requirements/需求文档.docx
```

**输出**:
- `{filename}.md` - Markdown 文件
- `{filename}_images/` - 图片目录（如果有图片）
  - `image_001.png`
  - `image_002.jpg`
  - ...

**特性**:
- ✅ 自动提取所有图片类型（PNG, JPG, GIF, BMP, TIFF, WebP）
- ✅ 保持图片在文档中的位置
- ✅ 自动清理文本格式
- ✅ 生成规范的 Markdown 结构

### 2. Markdown → DOCX

**脚本**: `scripts/md_to_docx.py`

**功能**:
- 将 Markdown 转换为 DOCX 格式
- 支持标题、列表、代码块等 Markdown 元素
- 保持文档结构

**使用方法**:
```bash
python .claude/skills/document-conversion/scripts/md_to_docx.py <markdown_file_path> [output_dir]
```

### 3. PDF → Markdown (Advanced)

**脚本**: `scripts/pdf_to_markdown_advanced.py`

**功能**:
- 提取 PDF 文本内容转为 Markdown
- 提取 PDF 中的图片（需要 Pillow）
- 支持复杂 PDF 布局
- 保存图片并生成引用

**使用方法**:
```bash
# 基本用法
python .claude/skills/document-conversion/scripts/pdf_to_markdown_advanced.py <pdf_file_path>

# 指定输出目录
python .claude/skills/document-conversion/scripts/pdf_to_markdown_advanced.py <pdf_file_path> <output_dir>

# 示例
python .claude/skills/document-conversion/scripts/pdf_to_markdown_advanced.py docs/api/API文档.pdf
```

**依赖**:
```bash
pip install pdfplumber pillow
```

**输出**:
- `{filename}.md` - Markdown 文件
- `{filename}_images/` - 图片目录
  - `page_001_img_01.png`
  - `page_002_img_01.png`
  - ...

### 4. OCR 图片 → Markdown

**脚本**: `scripts/ocr_images_to_markdown.py`

**功能**:
- 从图片中提取文字（OCR）
- 转换为 Markdown 格式
- 支持多种图片格式

**使用方法**:
```bash
python .claude/skills/document-conversion/scripts/ocr_images_to_markdown.py <image_file_path> [output_dir]
```

**适用场景**:
- 扫描的文档图片
- 截图文字提取
- 手写笔记识别

## 工作流场景

### 场景 1: 需求文档处理

**需求**: 将客户提供的 DOCX 需求文档转为项目 Markdown 文档

```bash
# 1. 转换为 Markdown
python .claude/skills/document-conversion/scripts/docx_to_markdown.py docs/requirements/客户需求.docx docs/requirements/

# 输出:
# - docs/requirements/客户需求.md
# - docs/requirements/客户需求_images/
```

**Claude Code 使用**:
```
User: 把 docs/requirements/客户需求.docx 转成 Markdown

Claude: 使用文档转换工具...
正在执行: python .claude/skills/document-conversion/scripts/docx_to_markdown.py docs/requirements/客户需求.docx docs/requirements/

✓ 已生成: docs/requirements/客户需求.md
✓ 提取了 5 张图片到 docs/requirements/客户需求_images/
```

### 场景 2: API 文档转换

**需求**: 将 PDF API 文档转为 Markdown 供开发使用

```bash
python .claude/skills/document-conversion/scripts/pdf_to_markdown_advanced.py docs/api/API设计文档.pdf docs/api/
```

### 场景 3: 文档发布

**需求**: 将项目 Markdown 文档转为 DOCX 供客户审阅

```bash
python .claude/skills/document-conversion/scripts/md_to_docx.py docs/architecture/系统架构.md docs/deliverables/
```

### 场景 4: 扫描文档数字化

**需求**: 将扫描的纸质文档转为可编辑的 Markdown

```bash
python .claude/skills/document-conversion/scripts/ocr_images_to_markdown.py scans/合同扫描.jpg docs/contracts/
```

## Claude Code 集成建议

### 自动识别转换需求

当用户提到文档转换时，Claude Code 应该：

1. **识别源格式和目标格式**
   ```
   User: 把这个 DOCX 转成 Markdown
   Claude: [识别需要使用 docx_to_markdown.py]
   ```

2. **检查依赖**
   ```
   Claude: 检查 Python 环境...
   Python 3.x ✓
   依赖库 python-docx ✓
   ```

3. **执行转换**
   ```bash
   python .claude/skills/document-conversion/scripts/docx_to_markdown.py {input_file} {output_dir}
   ```

4. **验证输出**
   ```
   Claude: 转换完成！
   - 生成文件: {output_file}.md
   - 提取图片: 3 张
   - 文件大小: 45 KB
   ```

### 批量转换支持

如果需要转换多个文件，可以使用 Bash 循环：

```bash
# 转换目录下所有 DOCX 文件
for file in docs/*.docx; do
  python .claude/skills/document-conversion/scripts/docx_to_markdown.py "$file" docs/markdown/
done
```

## 最佳实践

### 1. 文件命名规范

**转换前**:
- 使用有意义的文件名
- 避免特殊字符和空格
- 示例: `系统需求文档v1.0.docx`

**转换后**:
- 保持原文件名
- 添加 `.md` 扩展名
- 图片目录: `{原文件名}_images/`

### 2. 图片处理

**自动处理**:
- 所有图片提取到专用目录
- 使用顺序编号（`image_001.png`）
- Markdown 中使用相对路径引用

**手动优化**（可选）:
- 重命名图片为描述性名称
- 压缩大图片
- 更新 Markdown 引用

### 3. 质量检查

转换后检查：
- ✅ 所有图片正确显示
- ✅ 文档结构完整
- ✅ 特殊字符正确转义
- ✅ 链接和引用有效

### 4. 版本控制

**建议**:
- 原始文件不要提交到 Git（使用 `.gitignore`）
- 转换后的 Markdown 提交到 Git
- 图片目录也提交到 Git

**`.gitignore` 配置**:
```gitignore
# 原始文档（不提交）
*.docx
*.pdf
*.doc

# 转换后的文档（提交）
!docs/**/*.md
docs/**/*_images/
```

## 依赖安装

### Python 依赖

```bash
# DOCX 转换
pip install python-docx

# PDF 转换
pip install pdfplumber pillow

# OCR 转换
pip install pytesseract pillow
```

### 系统依赖

**OCR 需要 Tesseract**:

```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# 下载安装: https://github.com/UB-Mannheim/tesseract/wiki
```

## 常见问题

### Q: 转换后图片没有显示？

**A**: 检查图片路径
- Markdown 中使用相对路径
- 确保图片目录和 Markdown 文件在正确位置
- 检查图片文件是否成功提取

### Q: PDF 转换后格式混乱？

**A**: PDF 布局复杂
- 简单文本 PDF 效果最好
- 扫描 PDF 建议使用 OCR
- 复杂布局可能需要手动调整

### Q: 中文字符转换出错？

**A**: 编码问题
- 确保使用 UTF-8 编码
- 脚本已配置 `encoding='utf-8'`
- 检查系统区域设置

### Q: 批量转换如何实现？

**A**: 使用 Bash 脚本
```bash
#!/bin/bash
# 批量转换 DOCX 到 Markdown

for file in docs/input/*.docx; do
  echo "Converting $file..."
  python .claude/skills/document-conversion/scripts/docx_to_markdown.py "$file" docs/output/
done

echo "All conversions completed!"
```

## 相关资源

- **python-docx 文档**: https://python-docx.readthedocs.io/
- **pdfplumber 文档**: https://github.com/jsvine/pdfplumber
- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract

---

**记住**: 文档转换是项目中常见的任务。使用这些工具可以快速标准化文档格式，提高协作效率。
