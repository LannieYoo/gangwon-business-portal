#!/usr/bin/env python3
"""测试数据生成脚本 - Supabase API"""
from __future__ import annotations
import json, os, random, sys, subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4
import bcrypt

try:
    from supabase import create_client, Client
except ImportError:
    print("错误: pip install supabase")
    sys.exit(1)

from dotenv import load_dotenv
backend_dir = Path(__file__).parent.parent.parent
load_dotenv(backend_dir / ".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("错误: 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_KEY")
    sys.exit(1)

def load_config():
    with open(Path(__file__).parent / "test_data_config.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def weighted_choice(dist):
    return random.choices(list(dist.keys()), weights=list(dist.values()), k=1)[0]

def rand_dt(days_ago_max: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=random.randint(0, days_ago_max))).isoformat()

def rand_date(days_ago=0, days_ahead=0) -> str:
    start = datetime.now(timezone.utc) - timedelta(days=days_ago)
    end = datetime.now(timezone.utc) + timedelta(days=days_ahead)
    return (start + timedelta(days=random.randint(0, max((end-start).days, 1)))).strftime("%Y-%m-%d")

class Generator:
    def __init__(self):
        self.db: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.cfg = load_config()
        self.counts = self.cfg["generation_counts"]
        self.korean = self.cfg["korean_data"]
        self.defs = self.cfg["data_definitions"]
        self.ranges = self.cfg["data_ranges"]
        self.admin_id = None
        self.member_ids = []
        self.project_ids = []
        self.perf_ids = []
        self.msg_ids = []
        self.bucket = "public-files"
        self.prefix = "gangwon-portal"
        self.project_root = backend_dir.parent

    def upload_file(self, local_path: Path, storage_path: str) -> str | None:
        """上传本地文件到 Supabase Storage，返回公开 URL"""
        if not local_path.exists():
            print(f"    文件不存在: {local_path}")
            return None
        try:
            # 先尝试删除已存在的文件
            try:
                self.db.storage.from_(self.bucket).remove([storage_path])
            except:
                pass
            
            with open(local_path, 'rb') as f:
                file_data = f.read()
            
            content_type = "image/png" if local_path.suffix == ".png" else "image/jpeg"
            self.db.storage.from_(self.bucket).upload(
                storage_path,
                file_data,
                {"content-type": content_type}
            )
            return self.db.storage.from_(self.bucket).get_public_url(storage_path)
        except Exception as e:
            print(f"    上传失败: {e}")
            return None

    def clear_storage_folder(self, folder: str):
        """清空 Storage 文件夹"""
        try:
            path = f"{self.prefix}/{folder}"
            files = self.db.storage.from_(self.bucket).list(path)
            if files:
                for f in files:
                    try:
                        self.db.storage.from_(self.bucket).remove([f"{path}/{f['name']}"])
                    except:
                        pass
        except:
            pass

    def generate_local_images(self):
        """调用本地脚本生成图片"""
        scripts_dir = self.project_root / "scripts"
        
        # 生成横幅图片
        banner_script = scripts_dir / "generate_banners.py"
        if banner_script.exists():
            print("  生成横幅图片...")
            subprocess.run([sys.executable, str(banner_script)], cwd=str(scripts_dir), capture_output=True)
        
        # 生成新闻图片
        news_script = scripts_dir / "generate_news_images.py"
        if news_script.exists():
            print("  生成新闻图片...")
            subprocess.run([sys.executable, str(news_script)], cwd=str(scripts_dir), capture_output=True)
        
        # 生成项目图片
        project_script = scripts_dir / "generate_project_images.py"
        if project_script.exists():
            print("  生成项目图片...")
            subprocess.run([sys.executable, str(project_script)], cwd=str(scripts_dir), capture_output=True)

    def clear(self, table: str, pk_column: str = "id") -> int:
        """清空表数据 - 使用 neq 条件批量删除"""
        try:
            # 先查询记录数
            r = self.db.table(table).select(pk_column, count="exact").execute()
            count = r.count or 0
            if count == 0:
                return 0
            
            # 使用 neq 条件删除所有记录（Supabase delete 必须带条件）
            if pk_column == "id":
                # UUID 类型主键
                self.db.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            else:
                # 字符串类型主键
                self.db.table(table).delete().neq(pk_column, "").execute()
            return count
        except Exception as e:
            print(f"    清空 {table} 失败: {e}")
            return 0

    def clear_all(self):
        # 表名和主键列的映射
        tables = [
            ("attachments", "id"),
            ("project_applications", "id"),
            ("performance_records", "id"),
            ("messages", "id"),
            ("projects", "id"),
            ("members", "id"),
            ("admins", "id"),
            ("notices", "id"),
            ("press_releases", "id"),
            ("banners", "id"),
            ("faqs", "id"),
            ("system_info", "id"),
            ("legal_content", "id"),
            ("app_logs", "id"),
            ("error_logs", "id"),
            ("audit_logs", "id"),
            ("system_logs", "id"),
            ("performance_logs", "id"),
            ("nice_dnb_company_info", "biz_no"),
        ]
        total = 0
        for table, pk in tables:
            count = self.clear(table, pk)
            if count > 0:
                print(f"  - {table}: {count}")
            total += count
        print(f"  共清空: {total} 条")

    def gen_admin(self):
        cfg = self.cfg["accounts"]["admin"]
        self.admin_id = str(uuid4())
        self.db.table("admins").insert({
            "id": self.admin_id, "username": cfg["username"], "email": cfg["email"],
            "password_hash": hash_password(cfg["password"]), "full_name": cfg["full_name"], "is_active": "true"
        }).execute()

    def gen_members(self):
        for key in ["member_1", "member_2"]:
            cfg = self.cfg["accounts"][key]
            mid = str(uuid4())
            p = cfg.get("profile", {})
            self.db.table("members").insert({
                "id": mid, "business_number": cfg["business_number"], "company_name": cfg["company_name"],
                "email": cfg["email"], "password_hash": hash_password(cfg["password"]),
                "status": "active", "approval_status": "approved",
                "industry": p.get("industry"), "revenue": p.get("revenue"), "employee_count": p.get("employee_count"),
                "region": p.get("region"), "address": p.get("address"), "representative": p.get("representative"),
                "phone": p.get("phone"), "website": p.get("website"),
                "contact_person_name": p.get("contact_person_name"),
                "contact_person_department": p.get("contact_person_department"),
                "contact_person_position": p.get("contact_person_position"),
                "main_business": p.get("main_business"),
                "description": p.get("description")
            }).execute()
            self.member_ids.append(mid)

    def gen_projects(self):
        titles = self.korean["project_titles"]
        r = self.ranges["project"]
        uploads_dir = self.project_root / "frontend" / "public" / "uploads" / "projects"
        
        # 获取会员信息用于关联
        m1 = self.cfg["accounts"]["member_1"]
        m2 = self.cfg["accounts"]["member_2"]
        members_info = [
            {"name": m1["company_name"], "biz_no": m1["business_number"]},
            {"name": m2["company_name"], "biz_no": m2["business_number"]},
        ]
        for i in range(self.counts["projects"]):
            pid = str(uuid4())
            start = rand_date(r["start_date_days_ago"], r["start_date_days_ahead"])
            end = (datetime.strptime(start, "%Y-%m-%d") + timedelta(days=random.randint(r["duration_days_min"], r["duration_days_max"]))).strftime("%Y-%m-%d")
            # 随机关联一个企业
            member_info = random.choice(members_info) if random.random() > 0.3 else None
            
            # 尝试上传本地生成的项目图片
            local_path = uploads_dir / f"project_{i}.jpg"
            image_url = None
            if local_path.exists():
                storage_path = f"{self.prefix}/projects/project_{i}.jpg"
                image_url = self.upload_file(local_path, storage_path)
            if not image_url:
                image_url = f"https://picsum.photos/seed/project{i}/800/400"
            
            project = {
                "id": pid, "title": titles[i % len(titles)],
                "description": f"{titles[i % len(titles)]}에 대한 상세 설명입니다. 강원도 소재 중소기업을 대상으로 하는 지원 프로그램입니다.",
                "start_date": start, "end_date": end,
                "image_url": image_url,
                "status": weighted_choice({"active": 0.6, "inactive": 0.3, "archived": 0.1}),
                "created_at": rand_dt(r["created_days_ago_max"])
            }
            if member_info:
                project["target_company_name"] = member_info["name"]
                project["target_business_number"] = member_info["biz_no"]
            self.db.table("projects").insert(project).execute()
            self.project_ids.append(pid)

    def gen_performance(self):
        r = self.ranges["performance"]
        types = self.defs["performance_types"]
        year = datetime.now().year
        for _ in range(self.counts["performance_records"]):
            pid = str(uuid4())
            t = random.choice(types)
            tr = r[t]
            if t == "sales":
                data = {"revenue": random.randint(tr["revenue_min"], tr["revenue_max"]), "employees": random.randint(tr["employees_min"], tr["employees_max"])}
            elif t == "support":
                data = {"support_amount": random.randint(tr["support_amount_min"], tr["support_amount_max"]), "programs": random.randint(tr["programs_min"], tr["programs_max"])}
            else:
                data = {"patents": random.randint(tr["patents_min"], tr["patents_max"]), "trademarks": random.randint(tr["trademarks_min"], tr["trademarks_max"])}
            self.db.table("performance_records").insert({
                "id": pid, "member_id": random.choice(self.member_ids),
                "year": random.randint(year - r["year_range"], year), "quarter": random.randint(1, 4),
                "type": t, "status": weighted_choice({"approved": 0.5, "submitted": 0.25, "draft": 0.15, "rejected": 0.1}),
                "data_json": data, "submitted_at": rand_dt(r["submitted_days_ago_max"]), "created_at": rand_dt(r["created_days_ago_max"])
            }).execute()
            self.perf_ids.append(pid)

    def gen_applications(self):
        r = self.ranges["application"]
        for _ in range(self.counts["project_applications"]):
            self.db.table("project_applications").insert({
                "id": str(uuid4()), "member_id": random.choice(self.member_ids), "project_id": random.choice(self.project_ids),
                "status": weighted_choice({"approved": 0.4, "under_review": 0.3, "submitted": 0.2, "rejected": 0.1}),
                "application_reason": "기업 성장을 위한 지원이 필요합니다.", "submitted_at": rand_dt(r["submitted_days_ago_max"])
            }).execute()

    def gen_notices(self):
        titles = self.korean["notice_titles"]
        for i in range(self.counts["notices"]):
            self.db.table("notices").insert({
                "id": str(uuid4()), "board_type": "notice", "title": titles[i % len(titles)],
                "content_html": f"<p>{titles[i % len(titles)]}에 대한 상세 내용입니다.</p>",
                "view_count": random.randint(0, 500), "created_at": rand_dt(120)
            }).execute()

    def gen_press(self):
        titles = self.korean["press_release_titles"]
        uploads_dir = self.project_root / "frontend" / "public" / "uploads" / "news"
        
        for i in range(self.counts["press_releases"]):
            # 尝试上传本地生成的新闻图片（图片目录是 0-7）
            local_main = uploads_dir / str(i) / "main.jpg"
            
            image_url = None
            if local_main.exists():
                storage_path = f"{self.prefix}/news/news_{i}_main.jpg"
                image_url = self.upload_file(local_main, storage_path)
            
            if not image_url:
                image_url = f"https://picsum.photos/seed/news{i}/1200/675"
            
            self.db.table("press_releases").insert({
                "id": str(uuid4()), "title": titles[i % len(titles)],
                "image_url": image_url, "created_at": rand_dt(120)
            }).execute()

    def gen_banners(self):
        # 横幅类型：使用前端定义的 banner_type 值
        uploads_dir = self.project_root / "frontend" / "public" / "uploads" / "banners"
        
        data = [
            {"type": "main_primary", "local_file": "main_primary", "title_ko": "강원 기업 포털", "title_zh": "江原企业门户", "subtitle_ko": "기업 성장을 위한 원스톱 지원 플랫폼", "subtitle_zh": "企业成长一站式支援平台"},
            {"type": "main_secondary", "local_file": "main_secondary", "title_ko": "2025년 강원도 창업기업 지원 가이드", "title_zh": "2025年江原道创业企业支援指南", "subtitle_ko": "전방위 지원으로 기업 성장을 돕습니다", "subtitle_zh": "全方位支援助力企业成长"},
            {"type": "about", "local_file": "about", "title_ko": "소개", "title_zh": "简介", "subtitle_ko": "강원 기업 포털에 오신 것을 환영합니다", "subtitle_zh": "欢迎来到江原企业门户"},
            {"type": "projects", "local_file": "projects", "title_ko": "지원 사업", "title_zh": "支援项目", "subtitle_ko": "다양한 기업 지원 프로그램", "subtitle_zh": "多样化企业支援计划"},
            {"type": "performance", "local_file": "performance", "title_ko": "실적 관리", "title_zh": "业绩管理", "subtitle_ko": "기업 실적 현황 및 분석", "subtitle_zh": "企业业绩现状及分析"},
            {"type": "support", "local_file": "support", "title_ko": "지원 센터", "title_zh": "支援中心", "subtitle_ko": "기업 지원 서비스 안내", "subtitle_zh": "企业支援服务指南"},
            {"type": "profile", "local_file": "profile", "title_ko": "기업 프로필", "title_zh": "企业资料", "subtitle_ko": "기업 정보 관리", "subtitle_zh": "企业信息管理"},
        ]
        
        for i, d in enumerate(data):
            # 尝试上传本地生成的横幅图片
            local_path = uploads_dir / f"{d['local_file']}.png"
            
            image_url = None
            if local_path.exists():
                storage_path = f"{self.prefix}/banners/{d['type']}.png"
                image_url = self.upload_file(local_path, storage_path)
            
            if not image_url:
                image_url = f"https://picsum.photos/seed/banner{d['type']}/1920/400"
            
            self.db.table("banners").insert({
                "id": str(uuid4()), "banner_type": d["type"], 
                "image_url": image_url,
                "title_ko": d["title_ko"], "title_zh": d["title_zh"],
                "subtitle_ko": d["subtitle_ko"], "subtitle_zh": d["subtitle_zh"],
                "is_active": "true", "display_order": i
            }).execute()

    def gen_faqs(self):
        items = self.korean["faq_items"]
        for i, item in enumerate(items[:self.counts["faqs"]]):
            self.db.table("faqs").insert({
                "id": str(uuid4()), "category": item["category"], "question": item["question"],
                "answer": item["answer"], "display_order": i
            }).execute()

    def gen_system_info(self):
        # 尝试上传本地生成的系统介绍图片
        uploads_dir = self.project_root / "frontend" / "public" / "uploads" / "banners"
        local_path = uploads_dir / "about.png"
        
        image_url = None
        if local_path.exists():
            storage_path = f"{self.prefix}/system/intro.png"
            image_url = self.upload_file(local_path, storage_path)
        
        if not image_url:
            image_url = "https://picsum.photos/seed/systeminfo/1200/600"
        
        self.db.table("system_info").insert({
            "id": str(uuid4()), 
            "content_html": """<h2>강원 기업 포털 소개</h2>
<p>강원 기업 포털은 강원도 소재 중소기업을 위한 종합 지원 플랫폼입니다.</p>
<h3>주요 서비스</h3>
<ul>
    <li>기업 지원 사업 안내 및 신청</li>
    <li>기업 실적 관리 및 분석</li>
    <li>1:1 상담 서비스</li>
    <li>공지사항 및 보도자료</li>
</ul>
<p>문의사항은 고객센터(033-123-4567)로 연락해 주세요.</p>""",
            "image_url": image_url
        }).execute()

    def gen_messages(self):
        subjects = self.korean["message_subjects"]
        
        # 生成管理员发送给会员的消息
        for i in range(self.counts["messages"] // 2):
            mid = str(uuid4())
            self.db.table("messages").insert({
                "id": mid, "message_type": "direct", 
                "sender_id": self.admin_id, "sender_type": "admin",
                "recipient_id": random.choice(self.member_ids), 
                "subject": subjects[i % len(subjects)],
                "content": "안녕하세요. 관리자입니다.", 
                "category": "notice", "status": "sent", "priority": "normal",
                "is_read": random.choice([True, False]), 
                "is_important": False, "is_broadcast": False, 
                "created_at": rand_dt(60)
            }).execute()
            self.msg_ids.append(mid)
        
        # 생成会员发送给管理员的1对1消息（咨询）
        inquiry_subjects = [
            "사업 신청 관련 문의",
            "성과 제출 방법 문의", 
            "회원 정보 수정 요청",
            "지원 프로그램 자격 문의",
            "시스템 사용법 문의",
            "서류 제출 관련 질문",
            "프로젝트 진행 상황 문의",
            "기술 지원 요청",
            "계정 문제 해결 요청",
            "기타 문의사항"
        ]
        
        for i in range(self.counts["messages"] // 2):
            mid = str(uuid4())
            member_id = random.choice(self.member_ids)
            self.db.table("messages").insert({
                "id": mid, "message_type": "direct",
                "sender_id": member_id, "sender_type": "member", 
                "recipient_id": self.admin_id,  # 관리员에게 발송
                "subject": inquiry_subjects[i % len(inquiry_subjects)],
                "content": "안녕하세요. 문의사항이 있어서 연락드립니다.",
                "category": "inquiry", "status": "sent", "priority": "normal",
                "is_read": random.choice([True, False]),
                "is_important": False, "is_broadcast": False,
                "created_at": rand_dt(60)
            }).execute()
            self.msg_ids.append(mid)

    def gen_attachments(self):
        templates = [
            {"resource_type": "performance", "file_name": "성과보고서.pdf"},
            {"resource_type": "message", "file_name": "첨부파일.pdf"},
        ]
        for i in range(self.counts["attachments"]):
            t = templates[i % len(templates)]
            rid = random.choice(self.perf_ids) if t["resource_type"] == "performance" and self.perf_ids else (random.choice(self.msg_ids) if self.msg_ids else str(uuid4()))
            self.db.table("attachments").insert({
                "id": str(uuid4()), "resource_type": t["resource_type"], "resource_id": rid,
                "file_type": "document", "file_url": f"private-files/gangwon-portal/attachments/{uuid4()}.pdf",
                "original_name": t["file_name"], "stored_name": f"{uuid4()}.pdf",
                "file_size": random.randint(50000, 500000), "mime_type": "application/pdf"
            }).execute()

    def gen_legal_content(self):
        """生成法律条款（服务条款、隐私政策）"""
        legal_data = self.korean.get("legal_content", {})
        for content_type in ["terms_of_service", "privacy_policy"]:
            content_html = legal_data.get(content_type, f"<p>{content_type} content</p>")
            self.db.table("legal_content").insert({
                "id": str(uuid4()),
                "content_type": content_type,
                "content_html": content_html,
                "updated_by": self.admin_id
            }).execute()

    def run(self):
        print("测试数据生成...")
        
        print("1. 生成本地图片...")
        self.generate_local_images()
        print("完成")
        
        print("2. 清空数据...")
        self.clear_all()
        
        print("3. 生成管理员...", end=" ")
        self.gen_admin()
        print("完成")
        
        print("4. 生成会员...", end=" ")
        self.gen_members()
        print("完成")
        
        print("5. 生成项目...", end=" ")
        self.gen_projects()
        print("完成")
        
        print("6. 生成成果记录...", end=" ")
        self.gen_performance()
        print("完成")
        
        print("7. 生成项目申请...", end=" ")
        self.gen_applications()
        print("完成")
        
        print("8. 生成公告...", end=" ")
        self.gen_notices()
        print("完成")
        
        print("9. 生成新闻（含图片上传）...", end=" ")
        self.gen_press()
        print("完成")
        
        print("10. 生成横幅（含图片上传）...", end=" ")
        self.gen_banners()
        print("完成")
        
        print("11. 生成FAQ...", end=" ")
        self.gen_faqs()
        print("完成")
        
        print("12. 生成系统信息（含图片上传）...", end=" ")
        self.gen_system_info()
        print("完成")
        
        print("13. 生成消息...", end=" ")
        self.gen_messages()
        print("完成")
        
        print("14. 生成附件...", end=" ")
        self.gen_attachments()
        print("完成")
        
        print("15. 生成法律条款...", end=" ")
        self.gen_legal_content()
        print("完成")
        
        admin = self.cfg["accounts"]["admin"]
        m1 = self.cfg["accounts"]["member_1"]
        m2 = self.cfg["accounts"]["member_2"]
        print(f"\n全部完成!")
        print(f"管理员: {admin['username']} / {admin['password']}")
        print(f"会员1: {m1['business_number']} / {m1['password']}")
        print(f"会员2: {m2['business_number']} / {m2['password']}")

if __name__ == "__main__":
    Generator().run()
