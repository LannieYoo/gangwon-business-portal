"""
Nice D&B API Integration Tests

Tests for Nice D&B API integration:
- Company verification endpoint (/api/members/verify-company)
- Admin company search endpoint (/api/admin/members/nice-dnb)
- OAuth 2.0 authentication flow
- Company search and verification logic
"""

import requests
import json
from datetime import datetime, timedelta
import os
import sys
import asyncio

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from unittest.mock import AsyncMock, patch, MagicMock
from src.common.modules.integrations.nice_dnb.service import NiceDnBClient
from src.common.modules.integrations.nice_dnb.schemas import (
    NiceDnBResponse,
    NiceDnBCompanyData,
    NiceDnBFinancialData,
    NiceDnBInsight,
)

# Configuration
BASE_URL = os.environ.get("TEST_BASE_URL", "http://127.0.0.1:8000")

ADMIN_CREDENTIALS = {
    "username": "000-00-00000",
    "password": "Admin123!"
}


class NiceDnBAPITester:
    """Nice D&B API tester class"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.admin_token: str = None
        self.results = []

    def log_result(self, test_name: str, success: bool, details: str):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": "pass" if success else "fail",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status} - {test_name}")
        print(f"   {details}\n")

    def get_admin_token(self) -> bool:
        """Get admin authentication token"""
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/admin-login",
                json=ADMIN_CREDENTIALS,
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("access_token")
                return True
            return False
        except Exception as e:
            print(f"Failed to get admin token: {str(e)}")
            return False

    def test_oauth_token_retrieval(self) -> bool:
        """TC1: Test OAuth 2.0 token retrieval"""
        test_name = "OAuth 2.0 Token Retrieval"
        try:
            # Mock the OAuth token endpoint response
            mock_token_response = {
                "access_token": "test_access_token_12345",
                "token_type": "Bearer",
                "expires_in": 3600
            }
            
            async def mock_post(*args, **kwargs):
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = mock_token_response
                mock_response.raise_for_status = MagicMock()
                return mock_response
            
            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = MagicMock()
                mock_client.__aenter__ = AsyncMock(return_value=mock_client)
                mock_client.__aexit__ = AsyncMock(return_value=None)
                mock_client.post = AsyncMock(side_effect=mock_post)
                mock_client_class.return_value = mock_client
                
                # Create client instance
                client = NiceDnBClient()
                client.api_key = "test_api_key"
                client.api_secret_key = "test_secret_key"
                
                # Test token retrieval
                token = asyncio.run(client._get_access_token())
                
                if token == "test_access_token_12345":
                    self.log_result(
                        test_name,
                        True,
                        f"Successfully retrieved OAuth token: {token[:20]}..."
                    )
                    return True
                else:
                    self.log_result(
                        test_name,
                        False,
                        f"Token mismatch. Expected 'test_access_token_12345', got '{token}'"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_oauth_token_caching(self) -> bool:
        """TC2: Test OAuth token caching mechanism"""
        test_name = "OAuth Token Caching"
        try:
            client = NiceDnBClient()
            client.api_key = "test_api_key"
            client.api_secret_key = "test_secret_key"
            
            # Set a cached token that hasn't expired
            client._access_token = "cached_token_12345"
            client._token_expires_at = datetime.now() + timedelta(hours=1)
            
            # Should return cached token without making API call
            token = asyncio.run(client._get_access_token())
            
            if token == "cached_token_12345":
                self.log_result(
                    test_name,
                    True,
                    "Token caching works correctly - returned cached token"
                )
                return True
            else:
                self.log_result(
                    test_name,
                    False,
                    f"Token caching failed. Expected 'cached_token_12345', got '{token}'"
                )
                return False
                
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_company_search_success(self) -> bool:
        """TC3: Test successful company search"""
        test_name = "Company Search - Success"
        try:
            # Mock API response
            mock_api_response = {
                "company_name": "테스트 기업",
                "name": "테스트 기업",
                "representative": "홍길동",
                "ceo": "홍길동",
                "address": "서울시 강남구",
                "location": "서울시 강남구",
                "industry": "IT",
                "sector": "IT",
                "established_date": "2020-01-01",
                "founding_date": "2020-01-01",
                "credit_grade": "A+",
                "rating": "A+",
                "risk_level": "low",
                "risk": "low",
                "summary": "우수 기업",
                "evaluation": "우수 기업",
                "financials": [
                    {
                        "year": 2023,
                        "revenue": 1000000000,
                        "sales": 1000000000,
                        "profit": 100000000,
                        "net_income": 100000000,
                        "employees": 50,
                        "employee_count": 50
                    }
                ],
                "insights": [
                    {
                        "label": "수출 비중",
                        "name": "수출 비중",
                        "value": "45%",
                        "trend": "up"
                    }
                ]
            }
            
            client = NiceDnBClient()
            client.api_key = "test_api_key"
            client.api_secret_key = "test_secret_key"
            client._access_token = "test_token"
            client._token_expires_at = datetime.now() + timedelta(hours=1)
            
            # Mock HTTP client
            async def mock_get(*args, **kwargs):
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = mock_api_response
                mock_response.raise_for_status = MagicMock()
                return mock_response
            
            with patch("httpx.AsyncClient") as mock_client_class:
                mock_client = MagicMock()
                mock_client.__aenter__ = AsyncMock(return_value=mock_client)
                mock_client.__aexit__ = AsyncMock(return_value=None)
                mock_client.get = AsyncMock(side_effect=mock_get)
                mock_client.post = AsyncMock()  # For token request
                mock_client_class.return_value = mock_client
                
                result = asyncio.run(client.search_company("1234567890"))
                
                if result and result.success and result.data.company_name == "테스트 기업":
                    self.log_result(
                        test_name,
                        True,
                        f"Successfully searched company: {result.data.company_name}"
                    )
                    return True
                else:
                    self.log_result(
                        test_name,
                        False,
                        "Search failed or returned unexpected data"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_company_verification_success(self) -> bool:
        """TC4: Test successful company verification"""
        test_name = "Company Verification - Success"
        try:
            client = NiceDnBClient()
            client.api_key = "test_api_key"
            client.api_secret_key = "test_secret_key"
            client._access_token = "test_token"
            client._token_expires_at = datetime.now() + timedelta(hours=1)
            
            # Mock search_company to return valid response
            mock_response = NiceDnBResponse(
                success=True,
                data=NiceDnBCompanyData(
                    business_number="1234567890",
                    company_name="테스트 기업",
                    representative="홍길동"
                ),
                financials=[],
                insights=[]
            )
            
            with patch.object(client, "search_company", new=AsyncMock(return_value=mock_response)):
                # Test verification with matching company name
                verified = asyncio.run(
                    client.verify_company("1234567890", "테스트 기업")
                )
                
                if verified:
                    self.log_result(
                        test_name,
                        True,
                        "Company verification succeeded with matching name"
                    )
                    return True
                else:
                    self.log_result(
                        test_name,
                        False,
                        "Company verification failed despite matching name"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_company_verification_name_mismatch(self) -> bool:
        """TC5: Test company verification with name mismatch"""
        test_name = "Company Verification - Name Mismatch"
        try:
            client = NiceDnBClient()
            client.api_key = "test_api_key"
            client.api_secret_key = "test_secret_key"
            client._access_token = "test_token"
            client._token_expires_at = datetime.now() + timedelta(hours=1)
            
            # Mock search_company to return valid response
            mock_response = NiceDnBResponse(
                success=True,
                data=NiceDnBCompanyData(
                    business_number="1234567890",
                    company_name="테스트 기업",
                    representative="홍길동"
                ),
                financials=[],
                insights=[]
            )
            
            with patch.object(client, "search_company", new=AsyncMock(return_value=mock_response)):
                # Test verification with non-matching company name
                verified = asyncio.run(
                    client.verify_company("1234567890", "다른 기업")
                )
                
                if not verified:
                    self.log_result(
                        test_name,
                        True,
                        "Company verification correctly rejected mismatched name"
                    )
                    return True
                else:
                    self.log_result(
                        test_name,
                        False,
                        "Company verification incorrectly accepted mismatched name"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_company_search_not_configured(self) -> bool:
        """TC6: Test company search when API is not configured"""
        test_name = "Company Search - Not Configured"
        try:
            client = NiceDnBClient()
            client.api_key = None
            client.api_secret_key = None
            
            result = asyncio.run(client.search_company("1234567890"))
            
            if result is None:
                self.log_result(
                    test_name,
                    True,
                    "Correctly returned None when API is not configured"
                )
                return True
            else:
                self.log_result(
                    test_name,
                    False,
                    f"Should return None but got: {result}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_verify_company_endpoint(self) -> bool:
        """TC7: Test /api/members/verify-company endpoint"""
        test_name = "Verify Company Endpoint"
        try:
            # Mock the Nice D&B client
            with patch("src.modules.member.router.nice_dnb_client") as mock_client:
                mock_client.verify_company = AsyncMock(return_value=True)
                mock_client.search_company = AsyncMock(return_value=NiceDnBResponse(
                    success=True,
                    data=NiceDnBCompanyData(
                        business_number="1234567890",
                        company_name="테스트 기업"
                    ),
                    financials=[],
                    insights=[]
                ))
                
                # Make request to endpoint
                response = requests.post(
                    f"{self.base_url}/api/members/verify-company",
                    json={
                        "business_number": "123-45-67890",
                        "company_name": "테스트 기업"
                    },
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    if data.get("verified") is not None:
                        self.log_result(
                            test_name,
                            True,
                            f"Endpoint returned verification result: {data.get('verified')}"
                        )
                        return True
                    else:
                        self.log_result(
                            test_name,
                            False,
                            f"Response missing 'verified' field: {data}"
                        )
                        return False
                else:
                    self.log_result(
                        test_name,
                        False,
                        f"Endpoint returned status {response.status_code}: {response.text}"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def test_admin_search_endpoint(self) -> bool:
        """TC8: Test /api/admin/members/nice-dnb endpoint"""
        test_name = "Admin Company Search Endpoint"
        try:
            if not self.admin_token:
                if not self.get_admin_token():
                    self.log_result(
                        test_name,
                        False,
                        "Failed to get admin token"
                    )
                    return False
            
            # Mock the Nice D&B client
            with patch("src.modules.member.router.nice_dnb_client") as mock_client:
                mock_client.search_company = AsyncMock(return_value=NiceDnBResponse(
                    success=True,
                    data=NiceDnBCompanyData(
                        business_number="1234567890",
                        company_name="테스트 기업",
                        representative="홍길동",
                        address="서울시 강남구",
                        industry="IT"
                    ),
                    financials=[
                        NiceDnBFinancialData(
                            year=2023,
                            revenue=1000000000,
                            profit=100000000,
                            employees=50
                        )
                    ],
                    insights=[
                        NiceDnBInsight(
                            label="수출 비중",
                            value="45%",
                            trend="up"
                        )
                    ]
                ))
                
                # Make request to endpoint
                response = requests.get(
                    f"{self.base_url}/api/admin/members/nice-dnb",
                    params={"business_number": "123-45-67890"},
                    headers={"Authorization": f"Bearer {self.admin_token}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") or "company_name" in data:
                        self.log_result(
                            test_name,
                            True,
                            "Admin endpoint returned company data successfully"
                        )
                        return True
                    else:
                        self.log_result(
                            test_name,
                            False,
                            f"Response missing expected fields: {data}"
                        )
                        return False
                else:
                    self.log_result(
                        test_name,
                        False,
                        f"Endpoint returned status {response.status_code}: {response.text}"
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                test_name,
                False,
                f"Exception: {str(e)}"
            )
            return False

    def run_all_tests(self):
        """Run all Nice D&B API tests"""
        print("\n" + "="*60)
        print("Nice D&B API Integration Tests")
        print("="*60 + "\n")
        
        # Unit tests (service layer)
        self.test_oauth_token_retrieval()
        self.test_oauth_token_caching()
        self.test_company_search_success()
        self.test_company_verification_success()
        self.test_company_verification_name_mismatch()
        self.test_company_search_not_configured()
        
        # Integration tests (API endpoints)
        self.test_verify_company_endpoint()
        self.test_admin_search_endpoint()
        
        # Print summary and return results
        summary = self.print_summary()
        
        # Save results
        results_dir = os.path.join(os.path.dirname(__file__), "..", "test_results")
        os.makedirs(results_dir, exist_ok=True)
        
        with open(os.path.join(results_dir, "nice_dnb_test_results.json"), "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print("\nResults saved to: test_results/nice_dnb_test_results.json")
        
        return summary

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("Test Summary")
        print("="*60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "pass")
        failed = total - passed
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {success_rate:.1f}%")
        print("="*60 + "\n")
        
        return {
            "module": "nice_dnb_api",
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "success_rate": success_rate,
            "timestamp": datetime.now().isoformat(),
            "results": self.results
        }


def main():
    """Main entry point"""
    tester = NiceDnBAPITester(BASE_URL)
    return tester.run_all_tests()


if __name__ == "__main__":
    exit(main())

