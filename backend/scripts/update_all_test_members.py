"""
更新所有测试会员数据
"""
import os
from datetime import date
import json
from sqlalchemy import create_engine, Column, String, Integer, Text, TIMESTAMP, Date, Boolean, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import sys

# 添加父目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# 加载环境变量
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL.startswith('postgresql+asyncpg://'):
    DATABASE_URL = DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql+psycopg2://')

Base = declarative_base()

class Member(Base):
    """Member 模型"""
    __tablename__ = 'members'
    
    id = Column(Integer, primary_key=True)
    business_number = Column(String(50), unique=True)
    company_name = Column(String(255))
    industry = Column(String(100))
    revenue = Column(Numeric)
    employee_count = Column(Integer)
    founding_date = Column(Date)
    region = Column(String(100))
    representative = Column(String(100))
    representative_birth_date = Column(Date)
    representative_gender = Column(String(20))
    startup_stage = Column(String(50))
    ksic_major = Column(String(10))
    ksic_sub = Column(String(10))
    main_industry_ksic_major = Column(String(50))
    main_industry_ksic_codes = Column(Text)
    gangwon_industry = Column(String(50))
    future_tech = Column(String(50))
    cooperation_fields = Column(Text)
    participation_programs = Column(Text)
    status = Column(String(50))
    approval_status = Column(String(50))

def update_all_test_members():
    """更新所有测试会员"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # 测试数据配置
    test_members = [
        {
            "business_number": "1108801231",
            "company_name": "테스트 기업 (주)",
            "industry": "it",  # 使用英文代码
            "revenue": 5000000000,  # 50억
            "employee_count": 25,
            "founding_date": date(2018, 3, 15),
            "region": "hwacheon",  # 使用英文代码 (华川郡)
            "representative": "김철수",
            "representative_birth_date": date(1980, 5, 20),
            "representative_gender": "male",  # 小写
            "startup_stage": "growth",  # 修正为 growth (2018年成立，已超过3年)
            "ksic_major": "J",  # 정보통신업
            "ksic_sub": "62",  # 컴퓨터 프로그래밍, 시스템 통합 및 관리업
            "main_industry_ksic_major": "digital_health",
            "main_industry_ksic_codes": json.dumps(["26299"]),  # 디지털헬스케어
            "gangwon_industry": "semiconductor",
            "future_tech": "it",
            "cooperation_fields": json.dumps(["tech", "market", "talent"]),
            "participation_programs": json.dumps(["startup_university", "global_glocal", "rise"]),
        },
        {
            "business_number": "2312312312",
            "company_name": "천연물바이오 주식회사",
            "industry": "bio",  # 使用英文代码
            "revenue": 3000000000,  # 30억
            "employee_count": 15,
            "founding_date": date(2020, 6, 10),
            "region": "sokcho",  # 使用英文代码
            "representative": "이영희",
            "representative_birth_date": date(1985, 8, 15),
            "representative_gender": "female",  # 小写
            "startup_stage": "initial",
            "ksic_major": "C",  # 제조업
            "ksic_sub": "21",  # 의료용 물질 및 의약품 제조업
            "main_industry_ksic_major": "natural_bio",
            "main_industry_ksic_codes": json.dumps(["10795", "10797", "21102"]),  # 천연물바이오 관련
            "gangwon_industry": "bio_health",
            "future_tech": "bt",
            "cooperation_fields": json.dumps(["tech", "market"]),
            "participation_programs": json.dumps(["rise"]),
        },
        {
            "business_number": "7788602046",
            "company_name": "춘천바이오주식회사",
            "industry": "medical_bio",  # 使用英文代码
            "revenue": 8000000000,  # 80억
            "employee_count": 32,
            "founding_date": date(2015, 3, 20),
            "region": "chuncheon",  # 使用英文代码
            "representative": "박민수",
            "representative_birth_date": date(1978, 12, 5),
            "representative_gender": "male",  # 小写
            "startup_stage": "growth",
            "ksic_major": "C",
            "ksic_sub": "21",
            "main_industry_ksic_major": "natural_bio",
            "main_industry_ksic_codes": json.dumps(["21101", "21210", "20423"]),
            "gangwon_industry": "bio_health",
            "future_tech": "bt",
            "cooperation_fields": json.dumps(["tech", "talent"]),
            "participation_programs": json.dumps(["startup_university", "rise"]),
        },
        {
            "business_number": "1112233333",
            "company_name": "세라믹소재 테크",
            "industry": "ceramic",  # 使用英文代码
            "revenue": 1500000000,  # 15억
            "employee_count": 8,
            "founding_date": date(2022, 9, 1),
            "region": "goseong",  # 使用英文代码
            "representative": "최지훈",
            "representative_birth_date": date(1990, 4, 25),
            "representative_gender": "male",  # 小写
            "startup_stage": "pre_startup",
            "ksic_major": "C",
            "ksic_sub": "23",  # 비금속 광물제품 제조업
            "main_industry_ksic_major": "ceramic",
            "main_industry_ksic_codes": json.dumps(["23222", "23311", "23993"]),  # 세라믹 관련
            "gangwon_industry": "new_materials",
            "future_tech": "nt",
            "cooperation_fields": json.dumps(["market"]),
            "participation_programs": json.dumps([]),
        },
    ]
    
    try:
        print("=" * 80)
        print("🔄 更新所有测试会员数据")
        print("=" * 80)
        
        for data in test_members:
            business_number = data["business_number"]
            
            # 查找会员
            member = db.query(Member).filter(
                Member.business_number == business_number
            ).first()
            
            if not member:
                print(f"\n❌ 未找到会员: {business_number}")
                continue
            
            print(f"\n✅ 找到会员: {member.company_name} ({business_number})")
            
            # 更新字段
            for key, value in data.items():
                if key != "business_number":  # 不更新主键
                    setattr(member, key, value)
            
            # 设置状态
            member.status = "active"
            member.approval_status = "approved"
            
            print(f"   ✅ 已更新: {data['company_name']}")
            print(f"      - 营收: {data['revenue']:,}원")
            print(f"      - 员工: {data['employee_count']}명")
            print(f"      - 创业阶段: {data['startup_stage']}")
            print(f"      - 江原产业: {data['gangwon_industry']}")
        
        # 提交所有更改
        db.commit()
        
        print("\n" + "=" * 80)
        print("✅ 所有测试会员数据更新完成！")
        print("=" * 80)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ 更新失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    update_all_test_members()
