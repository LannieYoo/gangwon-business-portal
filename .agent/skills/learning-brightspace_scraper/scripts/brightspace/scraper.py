# Brightspace 课程数据抓取脚本
import asyncio
import json
import random
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

from playwright.async_api import async_playwright, Page, Browser

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from helpers import sanitize_filename, compute_content_hash
from config import COURSES, BASE_URL, OUTPUT_DIR, SESSION_FILE

MIN_DELAY = 1.0
MAX_DELAY = 3.0
HASH_FILE = ".content_hashes.json"


class BrightspaceScraper:
    def __init__(self, headless: bool = False, module_filter: str | None = None):
        self.headless = headless
        self.module_filter = module_filter  # 模块名称过滤器（支持部分匹配）
        self.playwright = None
        self.browser: Browser | None = None
        self.page: Page | None = None
        self.content_hashes: dict[str, str] = {}
        self.hash_file: Path | None = None
    
    async def start(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=self.headless)
        
        if SESSION_FILE.exists():
            context = await self.browser.new_context(storage_state=str(SESSION_FILE))
        else:
            context = await self.browser.new_context()
        
        self.page = await context.new_page()
    
    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def save_session(self):
        if self.page:
            await self.page.context.storage_state(path=str(SESSION_FILE))
            print("Session saved")
    
    async def _delay(self):
        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        await asyncio.sleep(delay)
    
    async def login(self):
        await self.page.goto(BASE_URL)
        
        if await self._is_logged_in():
            print("Already logged in")
            await self.save_session()
            return True
        
        print("Please login manually in the browser...")
        print("Waiting for login to complete...")
        
        try:
            await self.page.wait_for_url("**/d2l/home**", timeout=300000)
            await self.save_session()
            print("Login successful")
            return True
        except Exception as e:
            print(f"Login failed: {e}")
            return False
    
    async def _is_logged_in(self) -> bool:
        current_url = self.page.url
        return "/d2l/home" in current_url or "/d2l/le/" in current_url
    
    async def get_all_courses(self) -> list[dict]:
        """从首页获取所有课程列表"""
        await self.page.goto(f"{BASE_URL}/d2l/home")
        await self.page.wait_for_load_state("networkidle")
        
        courses = []
        
        course_links = await self.page.query_selector_all(
            'a.d2l-card-link[href*="/d2l/home/"]'
        )
        
        if not course_links:
            course_links = await self.page.query_selector_all(
                'd2l-enrollment-card a[href*="/d2l/home/"]'
            )
        
        if not course_links:
            course_links = await self.page.query_selector_all(
                'a[href*="/d2l/home/"]:not([href="/d2l/home"])'
            )
        
        for link in course_links:
            href = await link.get_attribute("href")
            if not href or href == "/d2l/home":
                continue
            
            import re
            match = re.search(r"/d2l/home/(\d+)", href)
            if match:
                course_id = match.group(1)
                
                title_elem = await link.query_selector(".d2l-card-title, .d2l-heading")
                if title_elem:
                    title = await title_elem.inner_text()
                else:
                    title = await link.inner_text()
                
                title = title.strip()
                if title and course_id:
                    courses.append({
                        "id": course_id,
                        "title": title
                    })
        
        return courses

    def _load_hashes(self, course_dir: Path):
        self.hash_file = course_dir / HASH_FILE
        if self.hash_file.exists():
            self.content_hashes = json.loads(self.hash_file.read_text(encoding="utf-8"))
        else:
            self.content_hashes = {}
    
    def _save_hashes(self):
        if self.hash_file:
            self.hash_file.write_text(
                json.dumps(self.content_hashes, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )

    async def scrape_course(self, course_id: str):
        course_name = COURSES.get(course_id, course_id)
        course_dir = OUTPUT_DIR / course_name
        course_dir.mkdir(parents=True, exist_ok=True)
        
        self._load_hashes(course_dir)
        
        print(f"Scraping course: {course_name} ({course_id})")
        
        content_url = f"{BASE_URL}/d2l/le/content/{course_id}/Home"
        await self.page.goto(content_url)
        await self.page.wait_for_load_state("networkidle")
        await self._save_html(course_dir, "index.html")
        
        modules = await self._get_modules_with_hierarchy()
        print(f"Found {len(modules)} top-level modules")
        
        for module in modules:
            await self._delay()
            await self._scrape_module_recursive(course_id, course_dir, module, "")
        
        self._save_hashes()

    async def _save_html(
        self, target_dir: Path, filename: str, module_path: str = ""
    ) -> bool:
        """保存 HTML，返回是否有变化"""
        if module_path:
            html_dir = target_dir / module_path
        else:
            html_dir = target_dir
        html_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = html_dir / filename
        html = await self.page.content()
        new_hash = compute_content_hash(html)
        
        hash_key = str(filepath.relative_to(target_dir))
        old_hash = self.content_hashes.get(hash_key)
        
        if old_hash == new_hash and filepath.exists():
            print(f"    Skip (unchanged): {filename}")
            return False
        
        filepath.write_text(html, encoding="utf-8")
        self.content_hashes[hash_key] = new_hash
        
        if old_hash:
            print(f"    Updated: {filename}")
        else:
            print(f"    Saved: {filename}")
        return True
    
    async def _get_modules_with_hierarchy(self) -> list[dict]:
        """获取模块列表，通过 DOM 嵌套结构解析层级关系"""
        await self.page.wait_for_selector("#D2L_LE_Content_TreeBrowser", timeout=10000)
        
        root_items = await self.page.query_selector_all(
            "#D2L_LE_Content_TreeBrowser > li.d2l-le-TreeAccordionItem"
        )
        
        modules = []
        for elem in root_items:
            module = await self._parse_module_element(elem)
            if module:
                modules.append(module)
        
        return modules
    
    async def _parse_module_element(self, elem) -> dict | None:
        """递归解析单个模块元素及其子模块"""
        data_key = await elem.get_attribute("data-key")
        if not data_key or data_key == "TOC":
            return None
        
        title_elem = await elem.query_selector(".d2l-textblock")
        if not title_elem:
            return None
        
        title = await title_elem.inner_text()
        module_id = None
        if "ModuleCO-" in data_key:
            module_id = data_key.split("-")[-1]
        
        children = []
        children_ul = await elem.query_selector(":scope > ul.d2l-le-TreeAccordionGroup")
        if children_ul:
            child_items = await children_ul.query_selector_all(
                ":scope > li.d2l-le-TreeAccordionItem"
            )
            for child_elem in child_items:
                child_module = await self._parse_module_element(child_elem)
                if child_module:
                    children.append(child_module)
        
        return {
            "title": title.strip(),
            "key": data_key,
            "id": module_id,
            "children": children
        }
    
    async def _collect_child_content_ids(
        self, course_id: str, children: list[dict]
    ) -> set[str]:
        """递归收集所有子模块的内容 ID"""
        content_ids = set()
        
        for child in children:
            module_id = child["id"]
            if not module_id:
                continue
            
            module_url = f"{BASE_URL}/d2l/le/content/{course_id}/Home?itemIdentifier=D2L.LE.Content.ContentObject.ModuleCO-{module_id}"
            await self.page.goto(module_url)
            await self.page.wait_for_load_state("networkidle")
            
            items = await self._get_content_items()
            for item in items:
                if item["content_id"]:
                    content_ids.add(item["content_id"])
            
            # 递归收集子模块的子模块
            if child["children"]:
                child_ids = await self._collect_child_content_ids(
                    course_id, child["children"]
                )
                content_ids.update(child_ids)
        
        return content_ids

    async def _scrape_module_recursive(
        self, course_id: str, course_dir: Path, module: dict, parent_path: str
    ):
        """递归抓取模块及其子模块"""
        module_title = module["title"]
        module_id = module["id"]
        children = module["children"]
        
        if not module_id:
            print(f"  Skip module (no ID): {module_title}")
            return
        
        # 应用模块过滤器
        if self.module_filter:
            # 检查当前模块或父路径是否匹配过滤器
            full_path = f"{parent_path}/{module_title}" if parent_path else module_title
            filter_lower = self.module_filter.lower()
            
            # 如果当前模块不匹配，但可能有子模块匹配，继续递归
            if filter_lower not in module_title.lower() and filter_lower not in full_path.lower():
                # 检查是否有子模块可能匹配
                has_matching_child = any(
                    filter_lower in child["title"].lower() 
                    for child in children
                )
                if not has_matching_child:
                    print(f"  Skip module (filtered): {module_title}")
                    return
                else:
                    # 只递归处理子模块，不抓取当前模块内容
                    print(f"  Entering module (has matching children): {module_title}")
                    for child in children:
                        await self._delay()
                        await self._scrape_module_recursive(course_id, course_dir, child, parent_path)
                    return
        
        safe_title = sanitize_filename(module_title)
        module_path = f"{parent_path}/{safe_title}" if parent_path else safe_title
        is_leaf = len(children) == 0
        
        print(f"  Module: {module_path} {'(leaf)' if is_leaf else '(parent)'}")
        
        module_url = f"{BASE_URL}/d2l/le/content/{course_id}/Home?itemIdentifier=D2L.LE.Content.ContentObject.ModuleCO-{module_id}"
        await self.page.goto(module_url)
        await self.page.wait_for_load_state("networkidle")
        
        await self._save_html(course_dir, "index.html", module_path)
        
        # 收集子模块的所有内容 ID（用于去重）
        child_content_ids = set()
        if children:
            child_content_ids = await self._collect_child_content_ids(
                course_id, children
            )
        
        # 抓取当前模块的内容项
        try:
            expand_btn = await self.page.query_selector('a:has-text("Expand All")')
            if expand_btn:
                await expand_btn.click()
                await self.page.wait_for_timeout(1000)
        except:
            pass
        
        # 重新加载当前模块页面（因为可能被子模块遍历改变了）
        if children:
            await self.page.goto(module_url)
            await self.page.wait_for_load_state("networkidle")
        
        items = await self._get_content_items()
        # 过滤掉子目录中已有的内容
        unique_items = [
            item for item in items 
            if item["content_id"] not in child_content_ids
        ]
        
        if unique_items:
            print(f"    Found {len(unique_items)} unique items")
            for item in unique_items:
                await self._delay()
                await self._process_item(course_id, course_dir, module_path, item)
        
        # 递归处理子模块
        for child in children:
            await self._delay()
            await self._scrape_module_recursive(course_id, course_dir, child, module_path)
    
    async def _get_content_items(self) -> list[dict]:
        items = []
        
        link_elements = await self.page.query_selector_all(
            '.d2l-datalist-item a.d2l-link[href*="/viewContent/"]'
        )
        
        for elem in link_elements:
            title = await elem.inner_text()
            href = await elem.get_attribute("href")
            
            content_id = None
            if "/viewContent/" in href:
                match = re.search(r"/viewContent/(\d+)/", href)
                if match:
                    content_id = match.group(1)
            
            parent = await elem.evaluate_handle(
                "el => el.closest('.d2l-datalist-item-content')"
            )
            type_elem = await parent.query_selector(".d2l-body-small")
            item_type = ""
            if type_elem:
                item_type = await type_elem.inner_text()
            
            items.append({
                "title": title.strip(),
                "href": href,
                "type": item_type.strip().lower(),
                "content_id": content_id
            })
        
        return items

    async def _process_item(
        self, course_id: str, course_dir: Path, module_path: str, item: dict
    ):
        title = item["title"]
        href = item["href"]
        item_type = item["type"]
        content_id = item["content_id"]
        
        if not href:
            return
        
        full_url = urljoin(BASE_URL, href)
        safe_title = sanitize_filename(title)
        
        await self.page.goto(full_url)
        await self.page.wait_for_load_state("networkidle")
        
        html_filename = f"{content_id}_{safe_title}.html"
        changed = await self._save_html(course_dir, html_filename, module_path)
        
        if not changed:
            return
        
        file_types = ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "zip", "powerpoint", "word", "excel", "ipynb", "notebook", "py", "python"]
        is_file = any(ft in item_type.lower() for ft in file_types) or any(f".{ft}" in href.lower() for ft in ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "zip", "ipynb", "py"])
        
        if is_file:
            await self._download_file_by_button(course_dir, module_path, title)
        elif item_type == "link" or "web link" in item_type.lower():
            await self._extract_and_save_link(course_dir, module_path, title)
        else:
            await self._scrape_page_content(course_dir, module_path, title)

    async def _download_file_by_button(
        self, course_dir: Path, module_path: str, title: str
    ):
        """通过 Download 按钮下载文件"""
        target_dir = course_dir / module_path
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # 先尝试获取文件名，检查是否已存在
        # 方法1: 从页面上的文件名元素获取
        filename_elem = await self.page.query_selector('.d2l-fileviewer-pdf-name, .d2l-filename, [class*="filename"]')
        if filename_elem:
            suggested_filename = await filename_elem.inner_text()
            suggested_filename = suggested_filename.strip()
        else:
            suggested_filename = sanitize_filename(title)
        
        # 检查文件是否已存在（支持多种可能的文件名）
        possible_filenames = [
            suggested_filename,
            sanitize_filename(title),
            f"{sanitize_filename(title)}.pdf",
            f"{sanitize_filename(title)}.pptx",
            f"{sanitize_filename(title)}.docx",
        ]
        
        existing_file = None
        for fname in possible_filenames:
            fpath = target_dir / fname
            if fpath.exists():
                existing_file = fpath
                break
        
        if existing_file:
            print(f"      Skip (exists): {existing_file.name}")
            return
        
        selectors = [
            'button.d2l-button[id^="d2l_content_"]',
            'button.d2l-button[id^="d2l_fileviewer_"]',
            'button.d2l-button:has-text("Download")',
            'button:has-text("Download")',
            '.d2l-documentToPdfViewer-downloadButton',
            'd2l-button-icon[text*="Download"]',
            'a[download]',
        ]
        
        download_btn = None
        for selector in selectors:
            download_btn = await self.page.query_selector(selector)
            if download_btn:
                break
        
        if download_btn:
            try:
                print(f"      Downloading: {title}")
                async with self.page.expect_download(timeout=60000) as download_info:
                    await download_btn.click()
                download = await download_info.value
                
                actual_filename = download.suggested_filename
                if actual_filename:
                    filename = actual_filename
                else:
                    filename = sanitize_filename(title)
                
                filepath = target_dir / filename
                
                # 双重检查（以防文件名不同）
                if filepath.exists():
                    print(f"      Skip (exists): {filename}")
                    await download.delete()
                    return
                
                await download.save_as(str(filepath))
                print(f"      Saved: {filename}")
            except Exception as e:
                print(f"      Download failed: {e}")
        else:
            print(f"      No download button found: {title}")
    
    async def _try_direct_download(self, filepath: Path):
        """尝试从 iframe 或直接 URL 下载"""
        try:
            iframe = await self.page.query_selector('iframe[src*=".pdf"]')
            if iframe:
                src = await iframe.get_attribute("src")
                if src:
                    response = await self.page.request.get(src)
                    content = await response.body()
                    filepath.write_bytes(content)
                    print(f"      Saved (direct): {filepath.name}")
                    return
            
            object_elem = await self.page.query_selector('object[data*=".pdf"]')
            if object_elem:
                data_url = await object_elem.get_attribute("data")
                if data_url:
                    response = await self.page.request.get(data_url)
                    content = await response.body()
                    filepath.write_bytes(content)
                    print(f"      Saved (object): {filepath.name}")
                    return
            
            print(f"      Could not find PDF source")
        except Exception as e:
            print(f"      Direct download failed: {e}")

    async def _extract_and_save_link(
        self, course_dir: Path, module_path: str, title: str
    ):
        external_url = None
        
        html = await self.page.content()
        external_url = self._extract_url_from_d2l_or(html)
        
        if not external_url:
            iframe = await self.page.query_selector('iframe[src^="http"]')
            if iframe:
                src = await iframe.get_attribute("src")
                if src and "brightspace" not in src and "forethought" not in src:
                    external_url = src
        
        if not external_url:
            html_block = await self.page.query_selector("d2l-html-block")
            if html_block:
                html_content = await html_block.get_attribute("html")
                if html_content:
                    match = re.search(r'href="(https?://[^"]+)"', html_content)
                    if match:
                        url = match.group(1)
                        if "brightspace" not in url:
                            external_url = url
        
        if not external_url:
            ext_links = await self.page.query_selector_all('a[href^="http"]')
            for link in ext_links:
                href = await link.get_attribute("href")
                if href and "brightspace" not in href and "d2l" not in href:
                    external_url = href
                    break
        
        if not external_url:
            yt_iframe = await self.page.query_selector('iframe[src*="youtube"]')
            if yt_iframe:
                external_url = await yt_iframe.get_attribute("src")
        
        if external_url:
            await self._save_link(course_dir, module_path, title, external_url)
        else:
            print(f"      No external link found: {title}")
    
    def _extract_url_from_d2l_or(self, html: str) -> str | None:
        # 格式: OpenInNewWindow\",\"P\":[\"https:\/\/...
        start_marker = 'OpenInNewWindow\\",\\"P\\":[\\"'
        
        pos = 0
        while True:
            idx = html.find(start_marker, pos)
            if idx == -1:
                break
            
            url_start = idx + len(start_marker)
            url_end = html.find('\\"', url_start)
            if url_end == -1:
                break
            
            url = html[url_start:url_end]
            url = url.replace("\\/", "/")
            
            if "brightspace" not in url and "d2l" not in url:
                return url
            
            pos = url_end
        
        return None

    async def _scrape_page_content(
        self, course_dir: Path, module_path: str, title: str
    ):
        file_selectors = [
            'a.d2l-filelink-text[href*="DownloadAttachment"]',
            'a[href*="/DownloadAttachment"]',
            'a[href*=".pdf"]',
            'a[href*=".docx"]',
            'a[href*=".doc"]',
            'a[href*=".pptx"]',
            'a[href*=".xlsx"]',
            'a[href*=".zip"]',
        ]
        
        downloaded_urls = set()
        for selector in file_selectors:
            file_links = await self.page.query_selector_all(selector)
            for link in file_links:
                href = await link.get_attribute("href")
                if not href or href in downloaded_urls:
                    continue
                link_text = await link.inner_text()
                if href:
                    await self._delay()
                    full_url = urljoin(BASE_URL, href)
                    filename = link_text.strip() if link_text else title
                    await self._download_attachment(course_dir, module_path, filename, full_url)
                    downloaded_urls.add(href)
        
        ext_links = await self.page.query_selector_all('a[href^="http"]')
        for link in ext_links:
            href = await link.get_attribute("href")
            link_text = await link.inner_text()
            if href and link_text:
                link_text = link_text.strip()
                if (link_text and 
                    "brightspace" not in href and 
                    "d2l" not in href and
                    len(link_text) > 2):
                    await self._save_link(course_dir, module_path, link_text, href)
    
    async def _download_attachment(
        self, course_dir: Path, module_path: str, title: str, url: str
    ):
        """下载附件文件（PDF、DOCX等）"""
        target_dir = course_dir / module_path
        target_dir.mkdir(parents=True, exist_ok=True)
        
        filename = sanitize_filename(title)
        
        filepath = target_dir / filename
        
        if filepath.exists():
            print(f"      Skip attachment (exists): {filename}")
            return
        
        try:
            print(f"      Downloading attachment: {filename}")
            response = await self.page.request.get(url)
            content = await response.body()
            
            if len(content) > 1000:
                filepath.write_bytes(content)
                print(f"      Saved: {filename}")
            else:
                print(f"      File too small, might be error page")
        except Exception as e:
            print(f"      Attachment download failed: {e}")
    
    async def _download_pdf_from_url(
        self, course_dir: Path, module_path: str, title: str, url: str
    ):
        target_dir = course_dir / module_path / "files"
        target_dir.mkdir(parents=True, exist_ok=True)
        
        filename = sanitize_filename(title)
        if not filename.endswith(".pdf"):
            filename += ".pdf"
        
        filepath = target_dir / filename
        
        if filepath.exists():
            print(f"      Skip PDF (exists): {filename}")
            return
        
        try:
            print(f"      Downloading PDF: {filename}")
            full_url = urljoin(BASE_URL, url)
            response = await self.page.request.get(full_url)
            content = await response.body()
            
            if len(content) > 1000:
                filepath.write_bytes(content)
                print(f"      Saved: {filepath.name}")
            else:
                print(f"      PDF content too small, might be redirect page")
        except Exception as e:
            print(f"      PDF download failed: {e}")

    async def _save_link(
        self, course_dir: Path, module_path: str, title: str, url: str
    ):
        target_dir = course_dir / module_path
        target_dir.mkdir(parents=True, exist_ok=True)
        
        links_file = target_dir / "links.md"
        
        existing_links = set()
        if links_file.exists():
            content = links_file.read_text(encoding="utf-8")
            for line in content.split("\n"):
                if "](http" in line:
                    existing_links.add(line.strip())
        
        new_line = f"- [{title}]({url})"
        if new_line not in existing_links:
            with open(links_file, "a", encoding="utf-8") as f:
                if links_file.stat().st_size == 0 if links_file.exists() else True:
                    module_name = module_path.split("/")[-1] if "/" in module_path else module_path
                    f.write(f"# {module_name}\n\n")
                f.write(f"{new_line}\n")
            print(f"      Saved link: {title}")
        else:
            print(f"      Skip link (exists): {title}")


async def main():
    import argparse
    import sys
    
    args_list = sys.argv[1:]
    
    parser = argparse.ArgumentParser(description="Brightspace Course Scraper")
    parser.add_argument("--course", "-c", help="Course ID")
    parser.add_argument("--headless", action="store_true", help="Headless mode")
    parser.add_argument("--login-only", action="store_true", help="Only login")
    parser.add_argument("--keep-open", "-k", action="store_true", help="Keep browser open")
    parser.add_argument("--dump-html", action="store_true", help="Save page HTML")
    parser.add_argument("--list-courses", "-l", action="store_true", help="List all courses")
    parser.add_argument("--module", "-m", help="Only scrape modules matching this name (e.g., 'slides', 'labs', 'Week 1')")
    args = parser.parse_args(args_list)
    
    scraper = BrightspaceScraper(headless=args.headless, module_filter=args.module)
    
    try:
        await scraper.start()
        
        if not await scraper.login():
            print("Login failed, exiting")
            return
        
        if args.login_only:
            print("Login completed, session saved")
            if args.keep_open:
                print("Browser kept open. Press Ctrl+C to close.")
                await asyncio.Event().wait()
            return
        
        if args.list_courses:
            courses = await scraper.get_all_courses()
            print(f"\nFound {len(courses)} courses:\n")
            for c in courses:
                print(f"  {c['id']}: {c['title']}")
            print("\nAdd to config.py COURSES dict to scrape.")
            if args.keep_open:
                print("\nBrowser kept open. Press Ctrl+C to close.")
                await asyncio.Event().wait()
            return
        
        if args.dump_html:
            course_id = args.course or list(COURSES.keys())[0]
            content_url = f"{BASE_URL}/d2l/le/content/{course_id}/Home"
            await scraper.page.goto(content_url)
            await scraper.page.wait_for_load_state("networkidle")
            html = await scraper.page.content()
            html_file = Path(__file__).parent / "page.html"
            html_file.write_text(html, encoding="utf-8")
            print(f"HTML saved to {html_file}")
            if args.keep_open:
                print("Browser kept open. Press Ctrl+C to close.")
                await asyncio.Event().wait()
            return
        
        if args.course:
            await scraper.scrape_course(args.course)
        else:
            for course_id in COURSES:
                await scraper.scrape_course(course_id)
        
        print("Scraping completed")
        
        if args.keep_open:
            print("Browser kept open. Press Ctrl+C to close.")
            await asyncio.Event().wait()
        
    finally:
        if not args.keep_open:
            await scraper.stop()


if __name__ == "__main__":
    asyncio.run(main())
