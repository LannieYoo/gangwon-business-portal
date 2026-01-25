#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ottawa.ca PDF 下载脚本
用于自动下载 Ottawa Economic Development Update PDFs (Q1 2022 - Q4 2025)

使用方法:
    python download_ottawa_pdfs.py [--output-dir OUTPUT_DIR] [--year YEAR] [--quarter QUARTER]
    python download_ottawa_pdfs.py --list-urls  # 列出所有可用的 PDF URL
    python download_ottawa_pdfs.py --all  # 下载所有 PDF

示例:
    python download_ottawa_pdfs.py --year 2024 --quarter Q1
    python download_ottawa_pdfs.py --all --output-dir ../backend/uploads
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 尝试导入 Selenium（可选）
try:
    from selenium import webdriver  # type: ignore
    from selenium.webdriver.chrome.options import Options  # type: ignore
    from selenium.webdriver.common.by import By  # type: ignore
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False


def find_project_root() -> Path:
    """
    自动查找项目根目录（包含 backend 目录的目录）
    
    Returns:
        项目根目录的 Path 对象
    """
    # 从脚本文件位置开始
    script_dir = Path(__file__).parent.resolve()
    current = script_dir
    
    # 向上查找包含 backend 目录的目录
    while current != current.parent:
        backend_dir = current / "backend"
        if backend_dir.exists() and backend_dir.is_dir():
            return current
        current = current.parent
    
    # 如果找不到，返回脚本所在目录的父目录（假设 scripts 在项目根目录下）
    return script_dir.parent


class OttawaPDFDownloader:
    """Ottawa.ca PDF 下载器"""

    def __init__(self, output_dir: Optional[str] = None, timeout: int = 30):
        """
        初始化下载器

        Args:
            output_dir: PDF 保存目录（如果为 None，则自动检测项目根目录下的 backend/uploads）
            timeout: 请求超时时间（秒）
        """
        if output_dir is None:
            # 自动检测项目根目录
            project_root = find_project_root()
            output_dir = project_root / "backend" / "uploads"
        else:
            output_dir = Path(output_dir)
            # 如果是相对路径，尝试从项目根目录解析
            if not output_dir.is_absolute():
                project_root = find_project_root()
                # 如果路径以 .. 开头，说明是从 scripts 目录的相对路径
                if str(output_dir).startswith(".."):
                    output_dir = project_root / "backend" / "uploads"
                else:
                    output_dir = project_root / output_dir
        
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.timeout = timeout

        # 配置重试策略
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # 设置 User-Agent
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

        # Economic Development Update PDFs URL 模式
        # 实际 URL 格式: https://documents.ottawa.ca/sites/default/files/economic_update_q{quarter}_{year}_en.pdf
        self.base_url = "https://documents.ottawa.ca/sites/default/files"
        self.source_page_url = "https://ottawa.ca/en/planning-development-and-construction/housing-and-development-reports/local-economic-development-information/economic-development-update"
        # anchor_ids 不再需要硬编码，会自动发现所有可折叠区域
        self.pdf_urls = self._generate_pdf_urls()

    def _extract_pdf_links_from_webpage(self) -> Dict[str, str]:
        """
        从网页提取 PDF 链接（使用 Selenium 自动展开所有可折叠区域）
        自动发现页面上的所有可折叠按钮并展开它们
        
        Returns:
            Dict[year_quarter, pdf_url]: 提取到的 PDF URL 映射
        """
        extracted_urls = {}
        
        if not SELENIUM_AVAILABLE:
            print("⚠️  Selenium 未安装，无法从网页提取链接，将使用硬编码 URL")
            return extracted_urls
        
        print("🔍 尝试从网页提取 PDF 链接...")
        driver = None
        try:
            # 配置 Chrome 选项
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get(self.source_page_url)
            
            # 等待页面加载
            time.sleep(3)
            
            # 自动发现所有可折叠按钮
            print("\n🔍 自动发现所有可折叠区域...")
            
            # 查找所有可能的可折叠按钮
            # 方法1: 查找带有 data-toggle="collapse" 的按钮
            collapsible_buttons = driver.find_elements(
                By.CSS_SELECTOR, 
                "button[data-toggle='collapse'], button[data-target^='#'], button[aria-controls]"
            )
            
            # 方法2: 查找 aria-expanded="false" 的按钮（未展开的）
            collapsed_buttons = driver.find_elements(
                By.CSS_SELECTOR,
                "button[aria-expanded='false']"
            )
            
            # 合并并去重（通过按钮的定位信息）
            all_buttons = []
            seen_buttons = set()
            
            for btn in collapsible_buttons + collapsed_buttons:
                try:
                    # 使用按钮的位置和属性作为唯一标识
                    btn_id = btn.get_attribute('id') or ''
                    data_target = btn.get_attribute('data-target') or ''
                    aria_controls = btn.get_attribute('aria-controls') or ''
                    btn_text = btn.text[:50] if btn.text else ''  # 限制文本长度
                    
                    # 创建唯一标识
                    unique_id = f"{btn_id}|{data_target}|{aria_controls}|{btn_text}"
                    
                    if unique_id not in seen_buttons:
                        seen_buttons.add(unique_id)
                        all_buttons.append(btn)
                except Exception:
                    continue
            
            print(f"✓ 找到 {len(all_buttons)} 个可折叠按钮")
            
            # 展开所有找到的按钮
            expanded_count = 0
            for idx, btn in enumerate(all_buttons, 1):
                try:
                    # 检查按钮是否已经展开
                    aria_expanded = btn.get_attribute('aria-expanded')
                    if aria_expanded == 'true':
                        continue  # 已经展开，跳过
                    
                    # 获取按钮信息用于日志
                    data_target = btn.get_attribute('data-target') or ''
                    aria_controls = btn.get_attribute('aria-controls') or ''
                    btn_info = data_target or aria_controls or f"按钮 #{idx}"
                    
                    print(f"  [{idx}/{len(all_buttons)}] 展开: {btn_info}")
                    
                    # 滚动到按钮位置
                    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btn)
                    time.sleep(0.3)
                    
                    # 点击按钮
                    driver.execute_script("arguments[0].click();", btn)
                    time.sleep(1)  # 等待内容展开
                    
                    expanded_count += 1
                except Exception as e:
                    print(f"  ⚠️  展开按钮 #{idx} 时出错: {e}")
                    continue
            
            print(f"\n✓ 成功展开 {expanded_count} 个可折叠区域")
            
            # 等待所有内容加载
            time.sleep(2)
            
            # 提取所有 PDF 链接（从整个页面，包括所有已展开的区域）
            page_source = driver.page_source
            pdf_pattern = re.compile(r'https?://[^\s"\'<>]+\.pdf', re.IGNORECASE)
            all_pdf_urls = pdf_pattern.findall(page_source)
            
            print(f"\n✓ 找到 {len(all_pdf_urls)} 个 PDF 链接")
            
            # 解析链接，匹配年份和季度
            for pdf_url in all_pdf_urls:
                # 提取年份和季度信息
                year_match = re.search(r'(\d{4})', pdf_url)
                quarter_match = re.search(r'[qQ]([1-4])', pdf_url)
                
                if year_match and quarter_match:
                    year = int(year_match.group(1))
                    quarter_num = int(quarter_match.group(1))
                    quarter = f"Q{quarter_num}"
                    
                    # 只处理 2022-2025 年的链接
                    if 2022 <= year <= 2025:
                        key = f"{year}_{quarter}"
                        # 如果同一个 key 有多个 URL，保留第一个（或可以记录警告）
                        if key not in extracted_urls:
                            extracted_urls[key] = pdf_url
                            print(f"  ✓ {key}: {pdf_url}")
                        else:
                            print(f"  ⚠️  {key} 已有 URL，跳过重复: {pdf_url}")
            
        except Exception as e:
            print(f"⚠️  从网页提取链接失败: {e}")
        finally:
            if driver:
                driver.quit()
        
        return extracted_urls

    def _generate_pdf_urls(self) -> Dict[str, Dict[str, str]]:
        """
        生成 PDF URL 列表
        优先从网页提取，如果失败则使用硬编码 URL
        根据 PRD，需要下载 Q1 2022 - Q4 2025 的报告

        Returns:
            Dict[year_quarter, Dict]: PDF URL 和元数据
        """
        # 首先尝试从网页提取链接
        extracted_urls = self._extract_pdf_links_from_webpage()
        
        urls = {}

        # Q1 2022 - Q4 2025
        for year in range(2022, 2026):
            for quarter_num, quarter in enumerate(["Q1", "Q2", "Q3", "Q4"], 1):
                # 跳过 2025 年 Q4 之后（如果当前日期还没到）
                if year == 2025 and quarter == "Q4":
                    current_date = datetime.now()
                    if current_date.month < 10:  # Q4 通常在 10 月之后发布
                        continue

                key = f"{year}_{quarter}"
                
                # 优先使用从网页提取的 URL
                if key in extracted_urls:
                    pdf_url = extracted_urls[key]
                else:
                    # 回退到硬编码 URL
                    pdf_url = f"{self.base_url}/economic_update_q{quarter_num}_{year}_en.pdf"

                urls[key] = {
                    "year": year,
                    "quarter": quarter,
                    "possible_urls": [pdf_url],
                    "final_url": pdf_url,
                    "filename": f"Economic_Development_Update_{quarter}_{year}.pdf",
                    "title": f"Economic Development Update {quarter} {year}",
                }

        return urls

    def _find_pdf_url(self, possible_urls: List[str]) -> Optional[str]:
        """
        尝试找到有效的 PDF URL

        Args:
            possible_urls: 可能的 URL 列表

        Returns:
            有效的 PDF URL 或 None
        """
        for url in possible_urls:
            try:
                # 尝试直接访问 PDF
                full_url = urljoin(self.base_url, url)
                response = self.session.head(full_url, timeout=self.timeout, allow_redirects=True)
                
                if response.status_code == 200:
                    content_type = response.headers.get("Content-Type", "").lower()
                    if "pdf" in content_type:
                        return full_url

                # 如果不是 PDF，尝试在页面中查找 PDF 链接
                if not url.endswith(".pdf"):
                    response = self.session.get(full_url, timeout=self.timeout)
                    if response.status_code == 200:
                        # 查找页面中的 PDF 链接
                        pdf_links = re.findall(
                            r'href=["\']([^"\']*\.pdf[^"\']*)["\']',
                            response.text,
                            re.IGNORECASE
                        )
                        if pdf_links:
                            # 返回第一个找到的 PDF 链接
                            pdf_url = pdf_links[0]
                            if not pdf_url.startswith("http"):
                                pdf_url = urljoin(full_url, pdf_url)
                            return pdf_url

            except requests.RequestException as e:
                print(f"  ⚠️  尝试 URL {url} 失败: {e}")
                continue

        return None

    def _extract_metadata_from_filename(self, filename: str) -> Dict[str, str]:
        """
        从文件名提取元数据

        Args:
            filename: PDF 文件名

        Returns:
            元数据字典
        """
        metadata = {
            "source": "ottawa.ca",
            "document_type": "Economic Development Update",
            "upload_date": datetime.now().isoformat(),
        }

        # 提取年份和季度
        year_match = re.search(r"(\d{4})", filename)
        quarter_match = re.search(r"(Q[1-4])", filename, re.IGNORECASE)

        if year_match:
            metadata["year"] = year_match.group(1)
        if quarter_match:
            metadata["quarter"] = quarter_match.group(1).upper()

        return metadata

    def download_pdf(
        self, url: str, filename: str, metadata: Optional[Dict] = None
    ) -> Tuple[bool, str]:
        """
        下载单个 PDF 文件

        Args:
            url: PDF URL
            filename: 保存的文件名
            metadata: 可选的元数据

        Returns:
            (成功标志, 文件路径或错误消息)
        """
        try:
            print(f"📥 正在下载: {filename}")
            print(f"   URL: {url}")

            response = self.session.get(url, timeout=self.timeout, stream=True)
            response.raise_for_status()

            # 检查内容类型
            content_type = response.headers.get("Content-Type", "").lower()
            if "pdf" not in content_type:
                print(f"  ⚠️  警告: 内容类型不是 PDF ({content_type})")

            # 保存文件
            file_path = self.output_dir / filename
            total_size = int(response.headers.get("Content-Length", 0))

            with open(file_path, "wb") as f:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            print(f"\r   进度: {percent:.1f}% ({downloaded}/{total_size} bytes)", end="")

            print()  # 换行
            print(f"  ✅ 下载完成: {file_path}")

            # 保存元数据（如果提供）
            if metadata:
                metadata_file = file_path.with_suffix(".json")
                with open(metadata_file, "w", encoding="utf-8") as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                print(f"  📄 元数据已保存: {metadata_file}")

            return True, str(file_path)

        except requests.RequestException as e:
            error_msg = f"下载失败: {str(e)}"
            print(f"  ❌ {error_msg}")
            return False, error_msg
        except Exception as e:
            error_msg = f"保存文件失败: {str(e)}"
            print(f"  ❌ {error_msg}")
            return False, error_msg

    def download_by_quarter(self, year: int, quarter: str) -> bool:
        """
        下载指定季度和年份的 PDF

        Args:
            year: 年份
            quarter: 季度 (Q1, Q2, Q3, Q4)

        Returns:
            是否成功
        """
        key = f"{year}_{quarter}"
        if key not in self.pdf_urls:
            print(f"❌ 未找到 {quarter} {year} 的 PDF 配置")
            return False

        pdf_info = self.pdf_urls[key]
        print(f"\n🔍 下载 {pdf_info['title']}...")

        # 直接使用已设置的 URL
        final_url = pdf_info["final_url"]

        # 提取元数据
        metadata = self._extract_metadata_from_filename(pdf_info["filename"])
        metadata.update({
            "year": str(year),
            "quarter": quarter,
            "title": pdf_info["title"],
            "source_url": final_url,
        })

        # 下载
        success, result = self.download_pdf(
            final_url, pdf_info["filename"], metadata
        )

        return success

    def download_all(self) -> Dict[str, int]:
        """
        下载所有可用的 PDF

        Returns:
            统计信息字典
        """
        stats = {"total": 0, "success": 0, "failed": 0, "not_found": 0}

        print("\n🚀 开始批量下载 Ottawa Economic Development Updates")
        print(f"📁 保存目录: {self.output_dir}")
        print(f"📊 总计: {len(self.pdf_urls)} 个 PDF\n")

        for key, pdf_info in self.pdf_urls.items():
            stats["total"] += 1
            year = pdf_info["year"]
            quarter = pdf_info["quarter"]

            print(f"\n[{stats['total']}/{len(self.pdf_urls)}] {pdf_info['title']}")

            # 直接使用已设置的 URL
            final_url = pdf_info["final_url"]

            # 提取元数据
            metadata = self._extract_metadata_from_filename(pdf_info["filename"])
            metadata.update({
                "year": str(year),
                "quarter": quarter,
                "title": pdf_info["title"],
                "source_url": final_url,
            })

            # 下载
            success, _ = self.download_pdf(final_url, pdf_info["filename"], metadata)
            if success:
                stats["success"] += 1
            else:
                stats["failed"] += 1

            time.sleep(2)  # 避免请求过快

        return stats

    def list_urls(self) -> None:
        """列出所有可用的 PDF URL"""
        print("\n📋 Ottawa Economic Development Update PDFs (Q1 2022 - Q4 2025)\n")
        print(f"{'年份':<8} {'季度':<6} {'文件名':<50} {'状态':<10} {'URL':<60}")
        print("-" * 140)

        for key, pdf_info in sorted(self.pdf_urls.items()):
            year = pdf_info["year"]
            quarter = pdf_info["quarter"]
            filename = pdf_info["filename"]
            url = pdf_info["final_url"]
            status = "待下载"

            # 检查文件是否已存在
            file_path = self.output_dir / filename
            if file_path.exists():
                status = "已存在"

            print(f"{year:<8} {quarter:<6} {filename:<50} {status:<10} {url:<60}")

        print(f"\n📁 保存目录: {self.output_dir}")
        print(f"📊 总计: {len(self.pdf_urls)} 个 PDF\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="下载 Ottawa.ca Economic Development Update PDFs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  # 列出所有可用的 PDF
  python download_ottawa_pdfs.py --list-urls

  # 下载所有 PDF
  python download_ottawa_pdfs.py --all

  # 下载指定年份和季度的 PDF
  python download_ottawa_pdfs.py --year 2024 --quarter Q1

  # 下载指定年份的所有季度
  python download_ottawa_pdfs.py --year 2024

  # 指定输出目录
  python download_ottawa_pdfs.py --all --output-dir ../backend/uploads
        """,
    )

    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="PDF 保存目录 (默认: 自动检测项目根目录下的 backend/uploads)",
    )

    parser.add_argument(
        "--year",
        type=int,
        help="下载指定年份的 PDF (例如: 2024)",
    )

    parser.add_argument(
        "--quarter",
        type=str,
        choices=["Q1", "Q2", "Q3", "Q4"],
        help="下载指定季度的 PDF (需要配合 --year 使用)",
    )

    parser.add_argument(
        "--all",
        action="store_true",
        help="下载所有可用的 PDF (Q1 2022 - Q4 2025)",
    )

    parser.add_argument(
        "--list-urls",
        action="store_true",
        help="列出所有可用的 PDF URL 和状态",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="请求超时时间（秒）(默认: 30)",
    )

    args = parser.parse_args()

    # 创建下载器
    downloader = OttawaPDFDownloader(
        output_dir=args.output_dir, timeout=args.timeout
    )

    try:
        if args.list_urls:
            # 列出所有 URL
            downloader.list_urls()

        elif args.all:
            # 下载所有 PDF
            stats = downloader.download_all()
            print("\n" + "=" * 80)
            print("📊 下载统计:")
            print(f"  总计: {stats['total']}")
            print(f"  ✅ 成功: {stats['success']}")
            print(f"  ❌ 失败: {stats['failed']}")
            print(f"  ⚠️  未找到: {stats['not_found']}")
            print("=" * 80)

        elif args.year:
            if args.quarter:
                # 下载指定季度
                success = downloader.download_by_quarter(args.year, args.quarter)
                sys.exit(0 if success else 1)
            else:
                # 下载指定年份的所有季度
                quarters = ["Q1", "Q2", "Q3", "Q4"]
                success_count = 0
                for quarter in quarters:
                    if downloader.download_by_quarter(args.year, quarter):
                        success_count += 1
                    time.sleep(1)  # 避免请求过快

                print(f"\n📊 完成: {success_count}/{len(quarters)} 个季度下载成功")
                sys.exit(0 if success_count > 0 else 1)

        else:
            parser.print_help()
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断下载")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

