"""Test fixtures for company data."""
import pytest
from datetime import datetime
from typing import List, Dict, Any


@pytest.fixture
def sample_company_data() -> Dict[str, Any]:
    """Single company test data."""
    return {
        "business_number": "123-45-67890",
        "company_name": "테스트기업 A",
        "representative_name": "김철수",
        "representative_phone": "010-1234-5678",
        "ksic_code": "C10",
        "ksic_name": "식료품 제조업",
        "startup_stage": "성장기",
        "startup_date": datetime(2020, 1, 1),
        "address": "강원특별자치도 춘천시 테스트로 123",
        "sales_amt": 100000000,
        "emp_cnt": 10,
        "export_amt": 10000000,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }


@pytest.fixture
def sample_companies() -> List[Dict[str, Any]]:
    """Multiple companies test data."""
    return [
        {
            "business_number": "123-45-67890",
            "company_name": "테스트기업 A",
            "representative_name": "김철수",
            "ksic_code": "C10",
            "ksic_name": "식료품 제조업",
            "startup_stage": "성장기",
            "startup_date": datetime(2020, 1, 1),
            "sales_amt": 100000000,
            "emp_cnt": 10,
            "export_amt": 10000000,
        },
        {
            "business_number": "234-56-78901",
            "company_name": "테스트기업 B",
            "representative_name": "이영희",
            "ksic_code": "C26",
            "ksic_name": "전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업",
            "startup_stage": "초기",
            "startup_date": datetime(2022, 6, 15),
            "sales_amt": 50000000,
            "emp_cnt": 5,
            "export_amt": 5000000,
        },
        {
            "business_number": "345-67-89012",
            "company_name": "테스트기업 C",
            "representative_name": "박민수",
            "ksic_code": "J58",
            "ksic_name": "출판업",
            "startup_stage": "성숙기",
            "startup_date": datetime(2018, 3, 20),
            "sales_amt": 200000000,
            "emp_cnt": 20,
            "export_amt": 20000000,
        },
    ]


@pytest.fixture
def sample_programs() -> List[Dict[str, Any]]:
    """Program participation test data."""
    return [
        {
            "business_number": "123-45-67890",
            "program_type": "startup_center",
            "program_name": "창업중심대학",
            "participation_date": datetime(2021, 1, 1),
        },
        {
            "business_number": "123-45-67890",
            "program_type": "global_project",
            "program_name": "글로벌사업",
            "participation_date": datetime(2021, 6, 1),
        },
        {
            "business_number": "234-56-78901",
            "program_type": "rise_project",
            "program_name": "RISE사업단",
            "participation_date": datetime(2022, 1, 1),
        },
    ]


@pytest.fixture
def sample_investments() -> List[Dict[str, Any]]:
    """Investment test data."""
    return [
        {
            "business_number": "123-45-67890",
            "investment_date": datetime(2021, 3, 15),
            "investment_amount": 50000000,
            "investor_name": "테스트투자사 A",
            "investment_round": "Series A",
        },
        {
            "business_number": "234-56-78901",
            "investment_date": datetime(2022, 8, 20),
            "investment_amount": 100000000,
            "investor_name": "테스트투자사 B",
            "investment_round": "Seed",
        },
    ]


@pytest.fixture
def sample_patents() -> List[Dict[str, Any]]:
    """Patent test data."""
    return [
        {
            "business_number": "123-45-67890",
            "patent_number": "10-2021-0001234",
            "patent_name": "테스트 특허 A",
            "registration_date": datetime(2021, 5, 10),
            "patent_type": "발명특허",
        },
        {
            "business_number": "123-45-67890",
            "patent_number": "10-2022-0005678",
            "patent_name": "테스트 특허 B",
            "registration_date": datetime(2022, 3, 15),
            "patent_type": "실용신안",
        },
        {
            "business_number": "345-67-89012",
            "patent_number": "10-2020-0009012",
            "patent_name": "테스트 특허 C",
            "registration_date": datetime(2020, 11, 20),
            "patent_type": "발명특허",
        },
    ]


@pytest.fixture
def query_params_basic() -> Dict[str, Any]:
    """Basic query parameters."""
    return {
        "page": 1,
        "page_size": 10,
        "sort_by": "company_name",
        "sort_order": "asc",
    }


@pytest.fixture
def query_params_with_filters() -> Dict[str, Any]:
    """Query parameters with filters."""
    return {
        "year": 2024,
        "quarter": 1,
        "ksic_major": "C",
        "programs": ["startup_center", "global_project"],
        "has_investment": True,
        "investment_min": 10000000,
        "investment_max": 100000000,
        "patent_min": 1,
        "search_query": "테스트",
        "page": 1,
        "page_size": 20,
        "sort_by": "sales_amt",
        "sort_order": "desc",
    }
