#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF转Markdown脚本（高级版，支持图片提取）
用于将PDF文件转换为Markdown格式的文档，支持提取并保存图片

使用方法:
    python pdf_to_markdown_advanced.py <pdf_file_path> [output_dir]

示例:
    python pdf_to_markdown_advanced.py ../public/pdfs/ai-techniques/CST8504_02_Python_Primer.pdf
    python pdf_to_markdown_advanced.py ../public/pdfs/ai-techniques/CST8504_02_Python_Primer.pdf ./output
"""

import sys
import argparse
from pathlib import Path
import pdfplumber
import re
from typing import List, Tuple, Optional
from urllib.parse import quote

# 尝试导入图片处理库
PIL_AVAILABLE = False
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("警告: 图片处理功能不可用。需要安装: pip install pillow\n")


class PDFToMarkdownConverterAdvanced:
    """PDF转Markdown转换器（高级版，支持图片提取）"""

    def __init__(self, extract_images: bool = True):
        self.supported_formats = ['.pdf']
        self.extract_images = extract_images and PIL_AVAILABLE

    def extract_images_from_page(self, page) -> List["Image.Image"]:
        """
        从PDF页面中提取图片

        Args:
            page: pdfplumber页面对象

        Returns:
            List[Image.Image]: 图片列表
        """
        images = []
        if not self.extract_images:
            return images

        try:
            # 获取页面中的所有图片对象
            page_images = page.images
            if not page_images:
                return images

            # 尝试提取图片区域
            for img_obj in page_images:
                try:
                    # 获取图片边界框
                    bbox = (img_obj['x0'], img_obj['top'], img_obj['x1'], img_obj['bottom'])
                    # 裁剪页面区域
                    cropped = page.crop(bbox)
                    # 转换为PIL图片
                    try:
                        pil_image = cropped.to_image(resolution=200).original
                        images.append(pil_image)
                    except Exception:
                        pass
                except Exception:
                    pass
        except Exception as e:
            print(f"  警告: 提取图片时出错: {e}")

        return images

    def save_image(self, image: "Image.Image", page_num: int, img_index: int, images_dir: Path) -> str:
        """
        保存图片到文件

        Args:
            image: PIL图片对象
            page_num: 页码
            img_index: 图片索引（同一页的第几张图片）
            images_dir: 图片保存目录

        Returns:
            str: 图片的相对路径（用于Markdown引用）
        """
        # 确保图片目录存在
        images_dir.mkdir(parents=True, exist_ok=True)

        # 生成文件名
        filename = f"page_{page_num:03d}_img_{img_index:02d}.png"
        image_path = images_dir / filename

        # 保存图片
        try:
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            image.save(image_path, 'PNG', quality=95)

            # 返回相对于Markdown文件的路径
            return f"./{images_dir.name}/{filename}"
        except Exception as e:
            print(f"  警告: 保存图片失败: {e}")
            return ""

    def extract_text_from_pdf(self, pdf_path: str, images_dir: Optional[Path] = None) -> List[Tuple[int, str, List[str]]]:
        """
        从PDF文件中提取文本和图片

        Args:
            pdf_path: PDF文件路径
            images_dir: 图片保存目录

        Returns:
            List[Tuple[int, str, List[str]]]: 包含页码、文本和图片路径列表的元组列表
        """
        try:
            pages_text = []

            with pdfplumber.open(pdf_path) as pdf:
                total_pages = len(pdf.pages)
                print(f"  总共 {total_pages} 页，开始处理...")

                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    text = text.strip() if text else ""
                    image_paths = []

                    # 提取页面中的图片
                    if self.extract_images and images_dir:
                        try:
                            images = self.extract_images_from_page(page)
                            if images:
                                for img_index, img in enumerate(images, 1):
                                    img_path = self.save_image(img, page_num, img_index, images_dir)
                                    if img_path:
                                        image_paths.append(img_path)
                                print(f"  第 {page_num}/{total_pages} 页: 提取了 {len(images)} 张图片")
                        except Exception as e:
                            print(f"  第 {page_num} 页: 图片提取失败: {e}")

                    # 添加页面（即使文本为空，如果有图片也添加）
                    if text or image_paths:
                        pages_text.append((page_num, text, image_paths))

            return pages_text

        except Exception as e:
            print(f"错误：无法读取PDF文件 {pdf_path}: {e}")
            return []

    def format_text_with_markdown(self, text: str) -> str:
        """
        格式化文本为Markdown格式，包括列表、链接等

        Args:
            text: 原始文本

        Returns:
            str: 格式化后的Markdown文本
        """
        # 先按行分割，保留原始结构
        lines = text.split('\n')
        formatted_lines = []
        in_list = False
        prev_was_list = False
        prev_was_text = False

        for line in lines:
            line = line.strip()

            # 跳过空行和过短的行
            if not line or len(line) < 2:
                if in_list:
                    formatted_lines.append('')  # 列表结束
                    in_list = False
                    prev_was_list = True
                    prev_was_text = False
                elif prev_was_text:
                    formatted_lines.append('')  # 段落分隔
                    prev_was_text = False
                continue

            # 跳过可能是页码的行（只包含数字）
            if re.match(r'^\d+$', line):
                continue

            # 转换URL为Markdown链接
            line = re.sub(r'(https?://[^\s]+)', r'[\1](\1)', line)

            # 先处理行内的列表符号（不在行首的）
            line = re.sub(r'▪([^\s])', r'  - \1', line)  # 行内的▪符号

            # 检测列表项（❑、▪、■、•、-、* 等）
            list_patterns = [
                (r'^❑\s+', '- '),  # 空心方块
                (r'^▪\s+', '  - '),  # 实心方块（二级列表）
                (r'^■\s+', '- '),  # 实心方块
                (r'^•\s+', '- '),  # 圆点
                (r'^[-*]\s+', '- '),  # 减号或星号
                (r'^\d+\.\s+', r'\g<0>'),  # 数字编号（保留）
            ]

            is_list_item = False
            for pattern, replacement in list_patterns:
                if re.match(pattern, line):
                    # 移除列表符号，用Markdown列表符号替换
                    line = re.sub(pattern, replacement, line)
                    is_list_item = True
                    break

            # 处理列表嵌套
            if is_list_item:
                if not in_list and prev_was_text:
                    formatted_lines.append('')  # 在列表前添加空行
                if not in_list:
                    in_list = True
                formatted_lines.append(line)
                prev_was_list = True
                prev_was_text = False
            else:
                if in_list:
                    formatted_lines.append('')  # 列表结束
                    in_list = False

                # 普通文本行 - 尝试合并短行到前一行（如果它们看起来是同一段落）
                if prev_was_text and formatted_lines and formatted_lines[-1].strip():
                    last_line = formatted_lines[-1].strip()
                    # 判断是否应该合并
                    ends_with_punctuation = last_line.endswith(('.', '?', ':', '!'))
                    is_uppercase_title = last_line.isupper()
                    is_short_line = len(last_line) < 120
                    is_new_sentence = (line and len(line) > 5 and line[0].isupper() and
                                      (last_line.endswith((':', '-')) or len(last_line) > 50))

                    should_merge = (
                        not ends_with_punctuation and
                        not is_uppercase_title and
                        is_short_line and
                        not is_new_sentence
                    )

                    if should_merge and not line.strip().startswith('-'):
                        formatted_lines[-1] = last_line + ' ' + line.strip()
                    else:
                        formatted_lines.append(line)
                else:
                    if prev_was_list:
                        formatted_lines.append('')  # 列表后添加空行
                    formatted_lines.append(line)
                prev_was_list = False
                prev_was_text = True

        # 如果最后还在列表中，添加空行结束
        if in_list:
            formatted_lines.append('')

        return '\n'.join(formatted_lines)

    def format_as_markdown(self, pages_text: List[Tuple[int, str, List[str]]], title: str) -> str:
        """
        将提取的文本格式化为Markdown

        Args:
            pages_text: 页面文本列表（页码、文本、图片路径列表）
            title: 文档标题

        Returns:
            str: Markdown格式的文本
        """
        markdown_content = []

        # 添加标题和说明
        markdown_content.append(f"# {title}\n")
        markdown_content.append("_从 PDF 文档转换生成_\n")

        # 添加正文内容
        total_images = sum(len(image_paths) for _, _, image_paths in pages_text)
        if total_images > 0:
            markdown_content.append(f"\n_注: 共提取了 {total_images} 张图片_\n")

        markdown_content.append("\n")

        for page_num, text, image_paths in pages_text:
            formatted_text = self.format_text_with_markdown(text)

            # 如果有内容（文本或图片），添加页面标题
            if formatted_text.strip() or image_paths:
                page_header = f"## 第 {page_num} 页"
                markdown_content.append(f"{page_header}\n")

                # 添加文本内容
                if formatted_text.strip():
                    markdown_content.append(formatted_text)

                # 添加图片引用
                if image_paths:
                    if formatted_text.strip():
                        markdown_content.append("\n")  # 文本和图片之间添加空行
                    for img_path in image_paths:
                        sanitized_path = quote(img_path, safe="/._-")
                        markdown_content.append(f"\n![图片](<{sanitized_path}>)\n")

                markdown_content.append("\n\n---\n")

        return '\n'.join(markdown_content)

    def is_likely_heading(self, line: str) -> bool:
        """
        判断一行是否可能是标题

        Args:
            line: 文本行

        Returns:
            bool: 是否可能是标题
        """
        if len(line) < 5 or len(line) > 100:
            return False

        # 以数字开头的行
        if re.match(r'^\d+\.?\s+', line):
            return True

        # 全大写的短行
        if line.isupper() and len(line) < 50:
            return True

        # 包含常见标题关键词
        heading_keywords = ['introduction', 'overview', 'chapter', 'section', 'conclusion',
                          'summary', 'example', 'exercise', 'note', 'warning', 'tip']
        if any(keyword in line.lower() for keyword in heading_keywords):
            return True

        return False

    def convert_pdf_to_markdown(self, pdf_path: str, output_dir: Optional[str] = None) -> str:
        """
        将PDF转换为Markdown文件

        Args:
            pdf_path: PDF文件路径
            output_dir: 输出目录（可选）

        Returns:
            str: 生成的Markdown文件路径
        """
        pdf_path = Path(pdf_path)

        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF文件不存在: {pdf_path}")

        if pdf_path.suffix.lower() not in self.supported_formats:
            raise ValueError(f"不支持的文件格式: {pdf_path.suffix}")

        # 确定输出目录
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
        else:
            output_dir = pdf_path.parent

        # 生成输出文件名
        output_filename = f"{pdf_path.stem}.md"
        output_path = output_dir / output_filename

        # 创建图片保存目录（与Markdown文件同名，但加_images后缀）
        images_dir = output_dir / f"{pdf_path.stem}_images"

        print(f"正在处理PDF文件: {pdf_path}")
        print(f"输出文件: {output_path}")
        if self.extract_images:
            print("图片提取功能: 已启用")
            print(f"图片保存目录: {images_dir}")
        else:
            print("图片提取功能: 未启用")

        # 提取文本和图片
        pages_text = self.extract_text_from_pdf(str(pdf_path), images_dir)
        if not pages_text:
            raise ValueError("无法从PDF中提取内容")

        print(f"成功提取 {len(pages_text)} 页内容")

        # 生成Markdown
        title = pdf_path.stem.replace('_', ' ').replace('-', ' ')
        markdown_content = self.format_as_markdown(pages_text, title)

        # 写入文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        print(f"Markdown文件已生成: {output_path}")
        return str(output_path)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="将PDF文件转换为Markdown格式（支持图片提取）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  python pdf_to_markdown_advanced.py ../public/pdfs/ai-techniques/CST8504_02_Python_Primer.pdf
  python pdf_to_markdown_advanced.py ../public/pdfs/ai-techniques/CST8504_02_Python_Primer.pdf ./output
  python pdf_to_markdown_advanced.py ../public/pdfs/ai-techniques/*.pdf ./output
  python pdf_to_markdown_advanced.py file.pdf --no-images  # 禁用图片提取功能
        """
    )

    parser.add_argument(
        'pdf_path',
        help='PDF文件路径（支持通配符）'
    )

    parser.add_argument(
        'output_dir',
        nargs='?',
        help='输出目录（可选，默认为PDF文件所在目录）'
    )

    parser.add_argument(
        '--batch',
        action='store_true',
        help='批量处理模式（处理目录中的所有PDF文件）'
    )

    parser.add_argument(
        '--no-images',
        action='store_true',
        help='禁用图片提取功能'
    )

    args = parser.parse_args()

    converter = PDFToMarkdownConverterAdvanced(
        extract_images=not args.no_images
    )

    try:
        pdf_path = Path(args.pdf_path)

        if args.batch and pdf_path.is_dir():
            # 批量处理目录中的所有PDF文件
            pdf_files = list(pdf_path.glob('*.pdf'))
            if not pdf_files:
                print(f"在目录 {pdf_path} 中未找到PDF文件")
                return

            print(f"找到 {len(pdf_files)} 个PDF文件，开始批量转换...")

            for pdf_file in pdf_files:
                try:
                    converter.convert_pdf_to_markdown(str(pdf_file), args.output_dir)
                    print(f"✓ 已处理: {pdf_file.name}\n")
                except Exception as e:
                    print(f"✗ 处理失败 {pdf_file.name}: {e}\n")

            print("批量转换完成！")

        elif pdf_path.is_file():
            # 处理单个文件
            converter.convert_pdf_to_markdown(str(pdf_path), args.output_dir)

        else:
            # 处理通配符模式
            pdf_files = list(Path('.').glob(args.pdf_path))
            if not pdf_files:
                print(f"未找到匹配的PDF文件: {args.pdf_path}")
                return

            print(f"找到 {len(pdf_files)} 个匹配的PDF文件")

            for pdf_file in pdf_files:
                try:
                    converter.convert_pdf_to_markdown(str(pdf_file), args.output_dir)
                    print(f"✓ 已处理: {pdf_file.name}\n")
                except Exception as e:
                    print(f"✗ 处理失败 {pdf_file.name}: {e}\n")

    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

