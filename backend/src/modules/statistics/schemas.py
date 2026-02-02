from typing import List, Optional
from pydantic import BaseModel, Field, validator
from enum import Enum

# 统计排序字段枚举
class SortField(str, Enum):
    ENTERPRISE_NAME = "enterprise_name"
    TOTAL_INVESTMENT = "total_investment"
    PATENT_COUNT = "patent_count"
    ANNUAL_REVENUE = "annual_revenue"

# 排序方向枚举
class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

# 性别枚举
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

# 单条企业统计数据模型
class StatisticsItem(BaseModel):
    # 时间维度
    year: Optional[int] = None
    quarter: Optional[int] = None
    month: Optional[int] = None
    
    # 基本信息
    business_reg_no: str
    enterprise_name: str
    
    # 快速筛选组
    policy_tags: List[str] = Field(default_factory=list)
    
    # 企业特征组
    ksic_major: Optional[str] = None
    ksic_sub: Optional[str] = None
    gangwon_industry: Optional[str] = None
    gangwon_industry_sub: Optional[str] = None
    gangwon_future_industry: Optional[str] = None
    future_tech: Optional[str] = None
    work_years: Optional[int] = None
    startup_stage: Optional[str] = None
    region: Optional[str] = None
    
    # 经营指标组
    total_investment: float = 0.0
    annual_revenue: float = 0.0
    export_amount: float = 0.0
    employee_count: int = 0
    patent_count: int = 0
    
    # 代表者信息组
    representative_gender: Optional[str] = None
    representative_age: Optional[int] = None

# 统计数据列表响应模型
class StatisticsResponse(BaseModel):
    items: List[StatisticsItem]
    total: int
    page: int
    page_size: int

# 统计查询参数模型
class StatisticsQuery(BaseModel):
    # 时间筛选
    year: Optional[int] = None
    quarter: Optional[int] = None
    month: Optional[int] = None
    
    # 产业筛选 - 标准产业分类
    major_industry_codes: List[str] = Field(default_factory=list, description="KSIC 大分类代码 (A-U)")
    sub_industry_codes: List[str] = Field(default_factory=list, description="KSIC 中分类代码")
    
    # 产业筛选 - 江原道主导产业
    gangwon_industry_codes: List[str] = Field(default_factory=list, description="江原道主导产业大分类")
    gangwon_industry_sub_codes: List[str] = Field(default_factory=list, description="江原道主导产业中分类")
    
    # 产业筛选 - 江原道7大未来产业
    gangwon_future_industries: List[str] = Field(default_factory=list, description="江原道7大未来产业")
    
    # 产业筛选 - 未来有望新技术
    future_technologies: List[str] = Field(default_factory=list, description="未来有望新技术")
    
    # 企业分类
    startup_types: List[str] = Field(default_factory=list, description="创业类型")
    business_fields: List[str] = Field(default_factory=list, description="业务领域")
    cooperation_fields: List[str] = Field(default_factory=list, description="合作领域")
    
    # 政策关联筛选
    policy_tags: List[str] = Field(default_factory=list, description="参与项目标签")
    
    # 投资筛选
    has_investment: Optional[bool] = None
    min_investment: Optional[float] = None
    max_investment: Optional[float] = None
    
    # 专利筛选
    min_patents: Optional[int] = None
    max_patents: Optional[int] = None
    
    # 代表者特征
    gender: Optional[Gender] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    
    # 企业属性
    startup_stages: List[str] = Field(default_factory=list, description="创业阶段")
    min_work_years: Optional[int] = None
    max_work_years: Optional[int] = None
    
    # 经营成果
    min_revenue: Optional[float] = None
    max_revenue: Optional[float] = None
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    
    # 所在地
    region: Optional[str] = None
    
    # 搜索与分页
    search_query: Optional[str] = None
    page: int = 1
    page_size: int = 10
    sort_by: SortField = SortField.ENTERPRISE_NAME
    sort_order: SortOrder = SortOrder.ASC

    # 验证月份合法性
    @validator("month")
    def validate_month(cls, v):
        if v is not None and not (1 <= v <= 12):
            raise ValueError("月份必须在 1 到 12 之间")
        return v

    # 验证季度合法性
    @validator("quarter")
    def validate_quarter(cls, v):
        if v is not None and not (1 <= v <= 4):
            raise ValueError("季度必须在 1 到 4 之间")
        return v
    
    # 验证年龄范围
    @validator("min_age", "max_age")
    def validate_age(cls, v):
        if v is not None and (v < 0 or v > 150):
            raise ValueError("年龄必须在 0 到 150 之间")
        return v
    
    # 验证金额范围
    @validator("min_investment", "max_investment", "min_revenue", "max_revenue")
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError("金额不能为负数")
        return v
    
    # 验证数量范围
    @validator("min_patents", "max_patents", "min_employees", "max_employees", "min_work_years", "max_work_years")
    def validate_count(cls, v):
        if v is not None and v < 0:
            raise ValueError("数量不能为负数")
        return v

