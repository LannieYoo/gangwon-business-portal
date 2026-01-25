#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DOCX转Markdown脚本
用于将DOCX文件转换为Markdown格式的文档

使用方法:
    python docx_to_markdown.py <docx_file_path> [output_dir]

示例:
    python docx_to_markdown.py ../public/pdfs/knowledge-reasoning/Lab5\ KR\ Blocks/CST8503_Lab5_KR_Blocks.docx
"""

import sys
import argparse
from pathlib import Path
from docx import Document
import re
from typing import List, Tuple, Optional, Dict


class DOCXToMarkdownConverter:
    """DOCX转Markdown转换器"""

    def __init__(self):
        self.supported_formats = ['.docx']
        self.image_counter = 0
        self.images_dir = None
        self.image_map = {}  # 用于存储图片ID到文件名的映射

    def extract_images_from_docx(self, doc: Document, docx_stem: str) -> Dict[str, str]:
        """
        从DOCX文件中提取所有图片

        Args:
            doc: Document对象
            docx_stem: DOCX文件名（不含扩展名）

        Returns:
            Dict[str, str]: 图片rId到文件路径的映射
        """
        image_map = {}
        
        try:
            # 获取文档中的所有关系
            for rel in doc.part.rels.values():
                # 检查是否是图片关系
                if "image" in rel.target_ref:
                    try:
                        # 获取图片数据
                        image_data = rel.target_part.blob
                        
                        # 获取图片扩展名
                        content_type = rel.target_part.content_type
                        ext_map = {
                            'image/png': '.png',
                            'image/jpeg': '.jpg',
                            'image/jpg': '.jpg',
                            'image/gif': '.gif',
                            'image/bmp': '.bmp',
                            'image/tiff': '.tiff',
                            'image/webp': '.webp'
                        }
                        ext = ext_map.get(content_type, '.png')
                        
                        # 生成唯一的图片文件名
                        self.image_counter += 1
                        image_filename = f"image_{self.image_counter:03d}{ext}"
                        
                        # 保存图片
                        if self.images_dir:
                            image_path = self.images_dir / image_filename
                            with open(image_path, 'wb') as img_file:
                                img_file.write(image_data)
                            
                            # 存储映射关系
                            image_map[rel.rId] = image_filename
                            print(f"  已提取图片: {image_filename}")
                    
                    except Exception as e:
                        print(f"  警告: 无法提取图片 {rel.rId}: {e}")
                        continue
        
        except Exception as e:
            print(f"警告: 提取图片时出错: {e}")
        
        return image_map

    def get_paragraph_images(self, paragraph) -> List[str]:
        """
        获取段落中的所有图片ID

        Args:
            paragraph: 段落对象

        Returns:
            List[str]: 图片rId列表
        """
        image_rids = []
        
        try:
            # 查找段落中的所有图片
            for run in paragraph.runs:
                # 检查run中的drawing元素
                drawings = run._element.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}drawing')
                for drawing in drawings:
                    # 查找blip元素（包含图片引用）
                    blips = drawing.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
                    for blip in blips:
                        # 获取图片的rId
                        embed_attr = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'
                        if embed_attr in blip.attrib:
                            rid = blip.attrib[embed_attr]
                            image_rids.append(rid)
        
        except Exception as e:
            print(f"  警告: 获取段落图片时出错: {e}")
        
        return image_rids

    def extract_text_from_docx(self, doc: Document) -> List[Tuple[int, str, List[str]]]:
        """
        从DOCX文件中提取文本和图片信息

        Args:
            doc: Document对象

        Returns:
            List[Tuple[int, str, List[str]]]: 包含段落号、文本和图片rId列表的元组列表
        """
        try:
            paragraphs_data = []

            for para_num, para in enumerate(doc.paragraphs, 1):
                text = para.text
                image_rids = self.get_paragraph_images(para)
                
                # 如果有文本或图片，则添加该段落
                if (text and text.strip()) or image_rids:
                    paragraphs_data.append((para_num, text, image_rids))

            return paragraphs_data

        except Exception as e:
            print(f"错误：无法读取DOCX文件内容: {e}")
            return []

    def clean_text(self, text: str) -> str:
        """
        清理和格式化文本

        Args:
            text: 原始文本

        Returns:
            str: 清理后的文本
        """
        # 移除多余的空白字符
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def format_as_markdown(self, paragraphs_data: List[Tuple[int, str, List[str]]], title: str, images_dir_name: str) -> str:
        """
        将提取的文本和图片格式化为Markdown

        Args:
            paragraphs_data: 段落数据列表（包含文本和图片rId）
            title: 文档标题
            images_dir_name: 图片目录名

        Returns:
            str: Markdown格式的文本
        """
        markdown_content = []

        # 添加标题
        markdown_content.append(f"# {title}\n")
        markdown_content.append("---\n")

        # 添加正文内容
        for para_num, text, image_rids in paragraphs_data:
            # 添加文本内容
            cleaned_text = self.clean_text(text)
            if cleaned_text:
                markdown_content.append(cleaned_text)
                markdown_content.append("\n")
            
            # 添加图片
            if image_rids:
                for rid in image_rids:
                    if rid in self.image_map:
                        image_filename = self.image_map[rid]
                        image_path = f"{images_dir_name}/{image_filename}"
                        markdown_content.append(f"\n![{image_filename}]({image_path})\n")
                
            markdown_content.append("\n")

        return '\n'.join(markdown_content)

    def convert_docx_to_markdown(self, docx_path: str, output_dir: Optional[str] = None) -> str:
        """
        将DOCX转换为Markdown文件

        Args:
            docx_path: DOCX文件路径
            output_dir: 输出目录（可选）

        Returns:
            str: 生成的Markdown文件路径
        """
        docx_path = Path(docx_path)

        if not docx_path.exists():
            raise FileNotFoundError(f"DOCX文件不存在: {docx_path}")

        if docx_path.suffix.lower() not in self.supported_formats:
            raise ValueError(f"不支持的文件格式: {docx_path.suffix}")

        # 确定输出目录
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
        else:
            output_dir = docx_path.parent

        # 创建图片输出目录
        images_dir_name = f"{docx_path.stem}_images"
        self.images_dir = output_dir / images_dir_name
        self.images_dir.mkdir(parents=True, exist_ok=True)

        # 生成输出文件名
        output_filename = f"{docx_path.stem}.md"
        output_path = output_dir / output_filename

        print(f"正在处理DOCX文件: {docx_path}")
        print(f"输出文件: {output_path}")
        print(f"图片目录: {self.images_dir}")

        # 打开文档
        doc = Document(str(docx_path))

        # 提取图片
        print("\n提取图片中...")
        self.image_map = self.extract_images_from_docx(doc, docx_path.stem)
        if self.image_map:
            print(f"成功提取 {len(self.image_map)} 张图片")
        else:
            print("未找到图片")

        # 提取文本和图片位置
        print("\n提取文本内容中...")
        paragraphs_data = self.extract_text_from_docx(doc)
        if not paragraphs_data:
            raise ValueError("无法从DOCX中提取文本内容")

        print(f"成功提取 {len(paragraphs_data)} 段内容")

        # 生成Markdown
        title = docx_path.stem.replace('_', ' ').replace('-', ' ')
        markdown_content = self.format_as_markdown(paragraphs_data, title, images_dir_name)

        # 写入文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        print(f"\nMarkdown文件已生成: {output_path}")
        
        # 如果没有图片，删除空的图片目录
        if not self.image_map and self.images_dir.exists():
            try:
                self.images_dir.rmdir()
                print("已删除空的图片目录")
            except OSError:
                pass
        
        return str(output_path)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="将DOCX文件转换为Markdown格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  python docx_to_markdown.py ../public/pdfs/knowledge-reasoning/Lab5\\ KR\\ Blocks/CST8503_Lab5_KR_Blocks.docx
  python docx_to_markdown.py ../public/pdfs/knowledge-reasoning/Lab5\\ KR\\ Blocks/CST8503_Lab5_KR_Blocks.docx ./output
        """
    )

    parser.add_argument(
        'docx_path',
        help='DOCX文件路径'
    )

    parser.add_argument(
        'output_dir',
        nargs='?',
        help='输出目录（可选，默认为DOCX文件所在目录）'
    )

    args = parser.parse_args()

    converter = DOCXToMarkdownConverter()

    try:
        docx_path = Path(args.docx_path)

        if docx_path.is_file():
            # 处理单个文件
            converter.convert_docx_to_markdown(str(docx_path), args.output_dir)
        else:
            print(f"错误: 文件不存在或不是有效的DOCX文件: {docx_path}")
            sys.exit(1)

    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

