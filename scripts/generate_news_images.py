#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成新闻图片脚本

为每个新闻生成两张图片：
- thumbnail.jpg: 缩略图 (400x300)
- main.jpg: 主图 (1200x675)
"""

import json
import os
from pathlib import Path
from typing import Dict, Tuple
from PIL import Image, ImageDraw, ImageFont


# 新闻主题色彩配置
NEWS_THEMES = {
    9: {
        "primary": (75, 130, 180),    # 钢蓝色 - AI/科技主题
        "secondary": (135, 206, 250),  # 天蓝色
        "accent": (30, 144, 255),      # 道奇蓝
    },
    10: {
        "primary": (220, 20, 60),      # 深红色 - 博览会/活动主题
        "secondary": (255, 99, 71),    # 番茄红
        "accent": (255, 140, 0),       # 深橙色
    },
    11: {
        "primary": (72, 61, 139),      # 暗紫色 - 数字化转型主题
        "secondary": (138, 43, 226),   # 蓝紫色
        "accent": (186, 85, 211),      # 中紫色
    },
    12: {
        "primary": (34, 139, 34),      # 森林绿 - 国际交流主题
        "secondary": (50, 205, 50),    # 酸橙绿
        "accent": (144, 238, 144),     # 浅绿色
    },
    13: {
        "primary": (46, 125, 50),      # 深绿色 - 绿色技术主题
        "secondary": (76, 175, 80),    # 绿色
        "accent": (129, 199, 132),     # 浅绿色
    },
}


def load_news_data(json_path: str) -> Dict:
    """加载新闻数据"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {item['id']: item for item in data.get('news', []) if item['id'] in [9, 10, 11, 12, 13]}


def get_font_path():
    """获取字体路径，支持中文字体"""
    # 尝试常见的系统字体路径
    font_paths = [
        "C:/Windows/Fonts/msyh.ttc",  # 微软雅黑
        "C:/Windows/Fonts/simsun.ttc",  # 宋体
        "C:/Windows/Fonts/simhei.ttf",  # 黑体
        "/System/Library/Fonts/PingFang.ttc",  # macOS
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            return path
    
    # 如果找不到，返回 None，使用默认字体
    return None


def wrap_text(text: str, max_width: int, font: ImageFont.FreeTypeFont) -> list:
    """文本换行"""
    words = list(text)
    lines = []
    current_line = []
    current_width = 0
    
    for char in words:
        char_width = font.getlength(char)
        if current_width + char_width <= max_width:
            current_line.append(char)
            current_width += char_width
        else:
            if current_line:
                lines.append(''.join(current_line))
            current_line = [char]
            current_width = char_width
    
    if current_line:
        lines.append(''.join(current_line))
    
    return lines


def create_gradient_background(size: Tuple[int, int], color1: Tuple[int, int, int], 
                                color2: Tuple[int, int, int], direction: str = 'vertical') -> Image.Image:
    """创建渐变背景"""
    width, height = size
    image = Image.new('RGB', size, color1)
    draw = ImageDraw.Draw(image)
    
    if direction == 'vertical':
        for y in range(height):
            ratio = y / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    elif direction == 'horizontal':
        for x in range(width):
            ratio = x / width
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))
    else:  # diagonal
        # 对角线渐变（从左上到右下）
        max_distance = (width ** 2 + height ** 2) ** 0.5
        for y in range(0, height, 2):  # 每隔一行处理以加速
            for x in range(0, width, 2):  # 每隔一列处理以加速
                # 计算从左上角到当前点的距离
                distance = ((x ** 2 + y ** 2) ** 0.5) / max_distance
                r = int(color1[0] * (1 - distance) + color2[0] * distance)
                g = int(color1[1] * (1 - distance) + color2[1] * distance)
                b = int(color1[2] * (1 - distance) + color2[2] * distance)
                # 绘制2x2像素块
                draw.rectangle([x, y, min(x + 2, width), min(y + 2, height)], fill=(r, g, b))
    
    return image


def generate_thumbnail(news_id: int, title: str, theme: Dict, font_path: str = None) -> Image.Image:
    """生成缩略图 (400x300)"""
    width, height = 400, 300
    
    # 创建渐变背景
    bg = create_gradient_background(
        (width, height),
        theme['primary'],
        theme['secondary'],
        'diagonal'
    )
    
    draw = ImageDraw.Draw(bg)
    
    # 加载字体
    try:
        if font_path and os.path.exists(font_path):
            title_font = ImageFont.truetype(font_path, 28)
        else:
            title_font = ImageFont.load_default()
    except (OSError, IOError, Exception):
        title_font = ImageFont.load_default()
    
    # 绘制半透明覆盖层
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([20, 20, width - 20, height - 20], 
                          fill=(255, 255, 255, 200), outline=(255, 255, 255, 255), width=2)
    
    bg = bg.convert('RGBA')
    bg = Image.alpha_composite(bg, overlay)
    bg = bg.convert('RGB')
    draw = ImageDraw.Draw(bg)
    
    # 绘制标题
    title_lines = wrap_text(title, width - 60, title_font)
    y_offset = (height - len(title_lines) * 35) // 2
    
    for i, line in enumerate(title_lines[:3]):  # 最多3行
        bbox = draw.textbbox((0, 0), line, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        y = y_offset + i * 35
        draw.text((x, y), line, fill=theme['primary'], font=title_font)
    
    # 绘制装饰元素
    draw.ellipse([width - 80, height - 80, width - 20, height - 20], 
                fill=theme['accent'], outline=None)
    
    return bg


def generate_main_image(news_id: int, title: str, content: str, theme: Dict, font_path: str = None) -> Image.Image:
    """生成主图 (1200x675)"""
    width, height = 1200, 675
    
    # 创建渐变背景
    bg = create_gradient_background(
        (width, height),
        theme['primary'],
        theme['secondary'],
        'diagonal'
    )
    
    draw = ImageDraw.Draw(bg)
    
    # 加载字体
    try:
        if font_path and os.path.exists(font_path):
            title_font = ImageFont.truetype(font_path, 48)
            content_font = ImageFont.truetype(font_path, 24)
        else:
            title_font = ImageFont.load_default()
            content_font = ImageFont.load_default()
    except (OSError, IOError, Exception):
        title_font = ImageFont.load_default()
        content_font = ImageFont.load_default()
    
    # 转换为 RGBA 以支持透明度
    bg = bg.convert('RGBA')
    draw = ImageDraw.Draw(bg)
    
    # 绘制装饰图案（半透明圆形）
    overlay_decor = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    decor_draw = ImageDraw.Draw(overlay_decor)
    # 左上角圆形
    decor_draw.ellipse([-100, -100, 300, 300], fill=theme['accent'] + (100,), outline=None)
    # 右下角圆形
    decor_draw.ellipse([width - 200, height - 200, width + 100, height + 100], 
                      fill=theme['accent'] + (100,), outline=None)
    bg = Image.alpha_composite(bg, overlay_decor)
    draw = ImageDraw.Draw(bg)
    
    # 绘制内容区域
    content_x = 80
    content_y = 120
    content_width = width - 160
    content_height = height - 240
    
    # 半透明背景
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([content_x, content_y, content_x + content_width, content_y + content_height], 
                          fill=(255, 255, 255, 220))
    bg = Image.alpha_composite(bg, overlay)
    bg = bg.convert('RGB')
    draw = ImageDraw.Draw(bg)
    
    # 绘制标题
    title_lines = wrap_text(title, content_width - 40, title_font)
    title_y = content_y + 40
    
    for i, line in enumerate(title_lines[:2]):  # 最多2行
        bbox = draw.textbbox((0, 0), line, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = content_x + (content_width - text_width) // 2
        y = title_y + i * 60
        # 绘制文本阴影
        draw.text((x + 2, y + 2), line, fill=(200, 200, 200), font=title_font)
        draw.text((x, y), line, fill=theme['primary'], font=title_font)
    
    # 绘制分隔线
    line_y = title_y + len(title_lines) * 60 + 30
    draw.line([(content_x + 20, line_y), (content_x + content_width - 20, line_y)], 
             fill=theme['accent'], width=3)
    
    # 绘制内容（摘要）
    content_preview = content[:80] + "..." if len(content) > 80 else content
    content_lines = wrap_text(content_preview, content_width - 40, content_font)
    content_start_y = line_y + 40
    
    for i, line in enumerate(content_lines[:4]):  # 最多4行
        bbox = draw.textbbox((0, 0), line, font=content_font)
        x = content_x + 20
        y = content_start_y + i * 35
        draw.text((x, y), line, fill=(60, 60, 60), font=content_font)
    
    # 绘制底部装饰
    draw.rectangle([content_x + 20, height - 80, content_x + content_width - 20, height - 60], 
                  fill=theme['accent'], outline=None)
    
    return bg


def generate_news_images(news_data: Dict, output_dir: str, font_path: str = None):
    """为所有新闻生成图片"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    for news_id, news in news_data.items():
        if news_id not in NEWS_THEMES:
            print(f"警告: 新闻 ID {news_id} 没有主题配置，跳过")
            continue
        
        theme = NEWS_THEMES[news_id]
        title = news['title']
        content = news.get('content', '')
        
        # 创建新闻目录
        news_dir = output_path / 'news' / str(news_id)
        news_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"正在生成新闻 {news_id} 的图片...")
        print(f"  标题: {title}")
        
        # 生成缩略图
        thumbnail = generate_thumbnail(news_id, title, theme, font_path)
        thumbnail_path = news_dir / 'thumbnail.jpg'
        thumbnail.save(thumbnail_path, 'JPEG', quality=85)
        print(f"  ✓ 缩略图已生成: {thumbnail_path}")
        
        # 生成主图
        main_image = generate_main_image(news_id, title, content, theme, font_path)
        main_path = news_dir / 'main.jpg'
        main_image.save(main_path, 'JPEG', quality=90)
        print(f"  ✓ 主图已生成: {main_path}")
        
        print()


def main():
    """主函数"""
    # 获取脚本所在目录的父目录（项目根目录）
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # 数据文件路径
    json_path = project_root / 'frontend' / 'src' / 'mocks' / 'data' / 'content' / 'zh.json'
    
    # 输出目录
    output_dir = project_root / 'frontend' / 'public' / 'uploads'
    
    if not json_path.exists():
        print(f"错误: 找不到数据文件: {json_path}")
        return
    
    print(f"数据文件: {json_path}")
    print(f"输出目录: {output_dir}")
    print()
    
    # 加载新闻数据
    news_data = load_news_data(str(json_path))
    if not news_data:
        print("错误: 没有找到新闻数据（ID: 9-13）")
        return
    
    print(f"找到 {len(news_data)} 条新闻")
    print()
    
    # 获取字体路径
    font_path = get_font_path()
    if font_path:
        print(f"使用字体: {font_path}")
    else:
        print("警告: 未找到中文字体，将使用默认字体（可能无法正确显示中文）")
    print()
    
    # 生成图片
    generate_news_images(news_data, str(output_dir), font_path)
    
    print("所有图片生成完成！")


if __name__ == '__main__':
    main()

