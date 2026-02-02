#!/usr/bin/env python3
"""
抓取 Medium 文章并转换为 Markdown

功能：
- 使用 Playwright 加载完整页面（包括动态内容）
- 下载完整 HTML 到本地
- 使用 html2text 转换为 Markdown
- 自动清理 UI 元素和广告内容
- 保留文章结构和图片链接

用法:
    uv run python scrape_medium_to_html.py <url> [-o output.md] [--keep-html]

示例:
    uv run python scrape_medium_to_html.py https://medium.com/@author/article
    uv run python scrape_medium_to_html.py https://medium.com/@author/article -o article.md
    uv run python scrape_medium_to_html.py https://medium.com/@author/article --keep-html
"""

import asyncio
import sys
import argparse
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import html2text
import re
import httpx
from bs4 import BeautifulSoup


class MediumScraper:
    """Medium 文章抓取器"""
    
    def __init__(self, url: str):
        self.url = url
        self.updated_url = None
    
    async def check_for_updates(self, page) -> str:
        """检查文章是否有更新版本链接"""
        try:
            # 查找更新链接（通常在文章开头）
            update_links = await page.evaluate("""
                () => {
                    const text = document.body.innerText;
                    const updateMatch = text.match(/UPDATE.*?(https?:\/\/[^\s\)]+)/i);
                    return updateMatch ? updateMatch[1] : null;
                }
            """)
            
            if update_links:
                print(f"  ℹ️  检测到更新版本: {update_links}")
                return update_links
            
            return None
        except Exception as e:
            print(f"  ⚠️  检查更新失败: {e}")
            return None
    
    async def save_html(self, html_path: Path):
        """保存完整的 HTML 页面"""
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            
            page = await context.new_page()
            
            try:
                print(f"📄 正在访问: {self.url}")
                await page.goto(self.url, wait_until='domcontentloaded', timeout=60000)
                
                # 等待文章加载
                try:
                    await page.wait_for_selector('article', timeout=15000)
                    print("✓ 文章内容已加载")
                except:
                    print("⚠️  等待超时，继续...")
                
                # 关闭弹窗
                await page.keyboard.press('Escape')
                await page.wait_for_timeout(1000)
                
                # 检查是否有更新版本
                self.updated_url = await self.check_for_updates(page)
                
                # 滚动加载
                await page.evaluate("""
                    async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 500;
                            const timer = setInterval(() => {
                                window.scrollBy(0, distance);
                                totalHeight += distance;
                                if(totalHeight >= document.documentElement.scrollHeight){
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 100);
                        });
                    }
                """)
                await page.wait_for_timeout(2000)
                print("  ✓ 所有内容已加载")
                
                # 等待 Gist 嵌入加载（Medium 使用 iframe 嵌入代码）
                try:
                    await page.wait_for_selector('iframe[src*="gist.github.com"]', timeout=5000)
                    print("  ✓ 检测到 GitHub Gist 代码块")
                    await page.wait_for_timeout(2000)  # 等待 iframe 内容加载
                except:
                    print("  ℹ️  未检测到 Gist 代码块")
                
                # 获取 HTML
                html_content = await page.content()
                html_path.write_text(html_content, encoding='utf-8')
                print(f"✓ HTML 已保存: {html_path}")
                
                # 提取 Gist URLs
                gist_urls = await page.evaluate("""
                    () => {
                        const iframes = document.querySelectorAll('iframe[src*="gist.github.com"]');
                        return Array.from(iframes).map(iframe => iframe.src);
                    }
                """)
                
                await browser.close()
                return gist_urls
                
            except Exception as e:
                print(f"✗ 失败: {e}")
                await browser.close()
                return []
    
    def html_to_markdown(self, html_path: Path, md_path: Path, gist_urls: list):
        """将 HTML 转换为 Markdown"""
        
        print(f"\n📝 正在转换为 Markdown...")
        
        html_content = html_path.read_text(encoding='utf-8')
        
        # 转换
        h = html2text.HTML2Text()
        h.ignore_links = False
        h.ignore_images = False
        h.body_width = 0
        h.unicode_snob = True
        
        markdown = h.handle(html_content)
        
        # 清理
        markdown = self._clean_markdown(markdown)
        
        # 添加 Gist 代码
        if gist_urls:
            print(f"  ℹ️  检测到 {len(gist_urls)} 个 Gist 代码块")
            markdown = self._append_gist_code(markdown, gist_urls)
        
        # 如果有更新版本，添加提示并尝试获取代码
        if self.updated_url:
            print(f"  ℹ️  尝试从更新版本获取代码: {self.updated_url}")
            markdown = self._append_updated_content(markdown)
        
        md_path.write_text(markdown, encoding='utf-8')
        print(f"✓ Markdown 已保存: {md_path}")
    
    def _clean_markdown(self, markdown: str) -> str:
        """清理 Markdown - 移除 UI 元素"""
        
        lines = markdown.split('\n')
        cleaned = []
        
        skip_keywords = [
            'Sign up', 'Sign in', 'Follow', 'Share', 'Save', 'Listen',
            'Open in app', 'Member-only', 'Clap', 'Response',
            'More from', 'Written by', 'Help', 'Status', 'About',
            'Careers', 'Press', 'Blog', 'Privacy', 'Terms',
            'Join Medium', 'Create account', 'Subscribe',
            'TDS Archive', 'publication', 'min read',
            'Write', '/m/signin', 'Follow publication',
            'An archive of', 'Get updates', 'stories in your inbox'
        ]
        
        end_markers = [
            '[Machine Learning](/tag/',
            '[Reinforcement Learning](/tag/',
            'See all from',
            'Recommended from Medium'
        ]
        
        article_ended = False
        article_started = False
        
        for line in lines:
            if article_ended:
                break
            
            if any(m in line for m in end_markers):
                article_ended = True
                continue
            
            if any(k in line for k in skip_keywords):
                continue
            
            stripped = line.strip()
            
            # 跳过空内容
            if stripped in ['[]()', '[]', '##', '#', '·', '']:
                continue
            
            # 跳过小图标
            if stripped.startswith('![](') and 'resize:fill:' in stripped:
                if any(s in stripped for s in [':32:', ':38:', ':48:', ':64:']):
                    continue
            
            # 跳过纯数字
            if stripped.isdigit() and len(stripped) < 5:
                continue
            
            # 跳过导航链接
            if stripped.startswith('[') and '/m/signin' in stripped:
                continue
            
            # 检测文章开始
            if not article_started:
                if stripped.startswith('# ') or stripped.startswith('## '):
                    title = stripped.lstrip('#').strip()
                    if title and len(title) > 5:
                        article_started = True
            
            if article_started:
                cleaned.append(line)
        
        # 添加头部
        header = f"# Q-Learning Math - Python Code\n\n"
        header += f"**Source:** {self.url}\n\n"
        header += "---\n\n"
        
        return header + '\n'.join(cleaned)
    
    def _append_gist_code(self, markdown: str, gist_urls: list) -> str:
        """从 Gist URLs 获取代码并添加到 Markdown"""
        
        code_section = "\n\n---\n\n## 📦 Code from Article\n\n"
        code_section += "> The following code blocks were embedded in the original article via GitHub Gist.\n\n"
        
        for i, gist_url in enumerate(gist_urls, 1):
            try:
                # 从 iframe URL 提取 Gist ID
                # 格式: https://medium.com/media/{hash}/href?url=https://gist.github.com/{user}/{gist_id}
                match = re.search(r'gist\.github\.com/([^/]+)/([^/?]+)', gist_url)
                if not match:
                    print(f"    ⚠️  无法解析 Gist URL: {gist_url}")
                    continue
                
                user, gist_id = match.groups()
                raw_url = f"https://gist.githubusercontent.com/{user}/{gist_id}/raw/"
                
                print(f"    正在获取 Gist {i}/{len(gist_urls)}: {user}/{gist_id}")
                
                # 获取 Gist 内容
                response = httpx.get(raw_url, follow_redirects=True, timeout=10)
                if response.status_code == 200:
                    code_content = response.text
                    
                    # 检测语言（从文件扩展名或内容）
                    language = "python"  # 默认
                    if ".py" in gist_url or "python" in code_content.lower()[:100]:
                        language = "python"
                    elif ".js" in gist_url:
                        language = "javascript"
                    
                    code_section += f"### Code Block {i}\n\n"
                    code_section += f"**Source:** [{user}/{gist_id}](https://gist.github.com/{user}/{gist_id})\n\n"
                    code_section += f"```{language}\n{code_content}\n```\n\n"
                    print(f"    ✓ 已获取代码块 {i}")
                else:
                    print(f"    ⚠️  获取失败 (HTTP {response.status_code})")
                    code_section += f"### Code Block {i}\n\n"
                    code_section += f"**Source:** [View on GitHub](https://gist.github.com/{user}/{gist_id})\n\n"
                    code_section += f"> ⚠️ Failed to fetch code automatically. Please visit the link above.\n\n"
                    
            except Exception as e:
                print(f"    ✗ 获取 Gist 失败: {e}")
                code_section += f"### Code Block {i}\n\n"
                code_section += f"> ⚠️ Error fetching code: {e}\n\n"
        
        return markdown + code_section
    
    def _append_updated_content(self, markdown: str) -> str:
        """从更新版本获取代码"""
        
        if not self.updated_url:
            return markdown
        
        try:
            print(f"    正在获取更新版本内容...")
            response = httpx.get(self.updated_url, follow_redirects=True, timeout=30)
            
            if response.status_code != 200:
                print(f"    ⚠️  获取失败 (HTTP {response.status_code})")
                return markdown + f"\n\n---\n\n## 📌 Updated Version\n\n**URL:** {self.updated_url}\n\n> ⚠️ Failed to fetch updated content. Please visit the link above.\n\n"
            
            from bs4 import BeautifulSoup
            
            # 使用 BeautifulSoup 解析 HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 查找所有代码块 (pre > code)
            code_blocks = soup.find_all('pre')
            
            if code_blocks:
                print(f"    ✓ 从更新版本提取到 {len(code_blocks)} 个代码块")
                
                code_section = "\n\n---\n\n## 📦 Code from Updated Version\n\n"
                code_section += f"**Source:** [{self.updated_url}]({self.updated_url})\n\n"
                code_section += "> The following code is from the updated version of the article.\n\n"
                
                for i, pre in enumerate(code_blocks, 1):
                    code = pre.get_text()
                    
                    # 跳过太短的代码块（可能是内联代码）
                    if len(code.strip()) < 20:
                        continue
                    
                    # 检测语言
                    language = "python"  # 默认
                    if "class" in code or "def" in code or "import" in code:
                        language = "python"
                    
                    code_section += f"### Code Block {i}\n\n```{language}\n{code.strip()}\n```\n\n"
                
                return markdown + code_section
            else:
                print(f"    ⚠️  未找到代码块")
                return markdown + f"\n\n---\n\n## 📌 Updated Version\n\n**URL:** [{self.updated_url}]({self.updated_url})\n\n> Please visit the updated version for complete code examples.\n\n"
                
        except Exception as e:
            print(f"    ✗ 获取更新版本失败: {e}")
            return markdown + f"\n\n---\n\n## 📌 Updated Version\n\n**URL:** {self.updated_url}\n\n> ⚠️ Error fetching updated content: {e}\n\n"


async def main():
    parser = argparse.ArgumentParser(description="抓取 Medium 文章")
    parser.add_argument("url", help="文章 URL")
    parser.add_argument("-o", "--output", type=Path, help="输出文件")
    parser.add_argument("--keep-html", action="store_true", help="保留 HTML")
    
    args = parser.parse_args()
    
    if not args.output:
        slug = args.url.rstrip('/').split('/')[-1]
        args.output = Path(f"{slug}.md")
    
    html_path = args.output.with_suffix('.html')
    
    scraper = MediumScraper(args.url)
    
    gist_urls = await scraper.save_html(html_path)
    if gist_urls is None:
        sys.exit(1)
    
    scraper.html_to_markdown(html_path, args.output, gist_urls)
    
    if not args.keep_html:
        html_path.unlink()
        print(f"  已删除临时文件: {html_path}")
    
    print(f"\n✅ 完成! 输出: {args.output}")


if __name__ == '__main__':
    asyncio.run(main())
