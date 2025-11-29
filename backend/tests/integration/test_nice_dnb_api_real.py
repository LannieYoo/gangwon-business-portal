"""
Real Nice D&B API Integration Test

This script tests the actual Nice D&B API integration with real API credentials.
It requires valid NICE_DNB_API_KEY and NICE_DNB_API_SECRET_KEY environment variables.

Usage:
    # Set environment variables
    export NICE_DNB_API_KEY=your-api-key
    export NICE_DNB_API_SECRET_KEY=your-secret-key
    export NICE_DNB_API_URL=https://openapi.nicednb.com
    
    # Run the test
    python tests/integration/test_nice_dnb_api_real.py
    
    # Or test with a specific business number
    python tests/integration/test_nice_dnb_api_real.py --business-number "123-45-67890"
"""

import asyncio
import os
import sys
import argparse
from typing import Optional
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.common.modules.integrations.nice_dnb import nice_dnb_client
from src.common.modules.logger import logger


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


def print_success(message: str):
    """Print success message in green."""
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")


def print_error(message: str):
    """Print error message in red."""
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")


def print_warning(message: str):
    """Print warning message in yellow."""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")


def print_info(message: str):
    """Print info message in blue."""
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")


def print_header(message: str):
    """Print header message."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")


async def test_oauth_token():
    """Test OAuth 2.0 token retrieval."""
    print_header("Test 1: OAuth 2.0 Token Retrieval")
    
    try:
        token = await nice_dnb_client._get_access_token()
        
        if token:
            print_success(f"OAuth token retrieved successfully")
            print_info(f"Token (first 20 chars): {token[:20]}...")
            return True
        else:
            print_error("Failed to retrieve OAuth token")
            print_warning("Check your API credentials (NICE_DNB_API_KEY and NICE_DNB_API_SECRET_KEY)")
            return False
    except Exception as e:
        print_error(f"Error retrieving OAuth token: {str(e)}")
        return False


async def test_company_search(business_number: str):
    """Test company search functionality."""
    print_header(f"Test 2: Company Search - {business_number}")
    
    try:
        print_info(f"Searching for business number: {business_number}")
        response = await nice_dnb_client.search_company(business_number)
        
        if response:
            if response.success:
                print_success("Company found in Nice D&B database")
                print(f"\n{Colors.BOLD}Company Information:{Colors.RESET}")
                print(f"  Business Number: {response.data.business_number}")
                print(f"  Company Name: {response.data.company_name}")
                if response.data.representative:
                    print(f"  Representative: {response.data.representative}")
                if response.data.address:
                    print(f"  Address: {response.data.address}")
                if response.data.industry:
                    print(f"  Industry: {response.data.industry}")
                if response.data.credit_grade:
                    print(f"  Credit Grade: {response.data.credit_grade}")
                if response.data.risk_level:
                    print(f"  Risk Level: {response.data.risk_level}")
                
                if response.financials:
                    print(f"\n{Colors.BOLD}Financial Data:{Colors.RESET}")
                    for financial in response.financials:
                        print(f"  Year {financial.year}:")
                        print(f"    Revenue: {financial.revenue:,} KRW")
                        print(f"    Profit: {financial.profit:,} KRW")
                        print(f"    Employees: {financial.employees}")
                
                if response.insights:
                    print(f"\n{Colors.BOLD}Business Insights:{Colors.RESET}")
                    for insight in response.insights:
                        trend_icon = "📈" if insight.trend == "up" else "📉" if insight.trend == "down" else "➡️"
                        print(f"  {insight.label}: {insight.value} {trend_icon}")
                
                return True
            else:
                print_warning("Company search returned unsuccessful response")
                return False
        else:
            print_error("Company search failed - no response received")
            print_warning("This could mean:")
            print_warning("  1. API is not configured (check environment variables)")
            print_warning("  2. Business number not found in database")
            print_warning("  3. API request failed (check network/credentials)")
            return False
    except Exception as e:
        print_error(f"Error searching company: {str(e)}")
        logger.exception("Company search error")
        return False


async def test_company_verification(business_number: str, company_name: Optional[str] = None):
    """Test company verification functionality."""
    print_header(f"Test 3: Company Verification - {business_number}")
    
    if company_name:
        print_info(f"Verifying business number: {business_number}")
        print_info(f"With company name: {company_name}")
    else:
        print_info(f"Verifying business number: {business_number} (name not provided)")
    
    try:
        if company_name:
            verified = await nice_dnb_client.verify_company(business_number, company_name)
        else:
            response = await nice_dnb_client.search_company(business_number)
            verified = response is not None and response.success
        
        if verified:
            print_success("Company verification succeeded")
            return True
        else:
            print_warning("Company verification failed")
            print_warning("This could mean:")
            print_warning("  1. Business number not found")
            if company_name:
                print_warning("  2. Company name does not match")
            return False
    except Exception as e:
        print_error(f"Error verifying company: {str(e)}")
        logger.exception("Company verification error")
        return False


async def test_api_endpoints(base_url: str = "http://127.0.0.1:8000", business_number: str = "123-45-67890"):
    """Test API endpoints (requires running server)."""
    print_header("Test 4: API Endpoints Integration")
    
    try:
        import httpx
        
        # Test verify-company endpoint
        print_info("Testing POST /api/members/verify-company")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/api/members/verify-company",
                json={
                    "business_number": business_number,
                    "company_name": None
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("Verify company endpoint responded successfully")
                print(f"  Verified: {data.get('verified')}")
                print(f"  Message: {data.get('message')}")
                if data.get('data'):
                    print(f"  Company Name: {data.get('company_name')}")
            else:
                print_warning(f"Endpoint returned status {response.status_code}")
                print_warning(f"Response: {response.text}")
        
        # Note: Admin endpoint requires authentication, so we skip it here
        print_info("Admin endpoint test skipped (requires authentication)")
        
        return True
    except ImportError:
        print_warning("httpx not installed, skipping API endpoint test")
        print_info("Install with: pip install httpx")
        return False
    except Exception as e:
        print_error(f"Error testing API endpoints: {str(e)}")
        return False


async def main():
    """Main test function."""
    parser = argparse.ArgumentParser(description="Test Nice D&B API integration with real credentials")
    parser.add_argument(
        "--business-number",
        type=str,
        default="123-45-67890",
        help="Business registration number to test (default: 123-45-67890)"
    )
    parser.add_argument(
        "--company-name",
        type=str,
        default=None,
        help="Company name to verify (optional)"
    )
    parser.add_argument(
        "--base-url",
        type=str,
        default="http://127.0.0.1:8000",
        help="Base URL for API endpoint tests (default: http://127.0.0.1:8000)"
    )
    parser.add_argument(
        "--skip-endpoints",
        action="store_true",
        help="Skip API endpoint tests (requires running server)"
    )
    
    args = parser.parse_args()
    
    print_header("Nice D&B API Real Integration Test")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Business Number: {args.business_number}")
    if args.company_name:
        print(f"Company Name: {args.company_name}")
    print()
    
    # Check environment variables
    api_key = os.getenv("NICE_DNB_API_KEY")
    api_secret = os.getenv("NICE_DNB_API_SECRET_KEY")
    
    if not api_key or not api_secret:
        print_error("Missing required environment variables!")
        print_warning("Please set:")
        print_warning("  NICE_DNB_API_KEY=your-api-key")
        print_warning("  NICE_DNB_API_SECRET_KEY=your-secret-key")
        print_warning("\nOptional:")
        print_warning("  NICE_DNB_API_URL=https://openapi.nicednb.com")
        return 1
    
    print_info("Environment variables configured")
    print_info(f"API URL: {os.getenv('NICE_DNB_API_URL', 'https://openapi.nicednb.com')}")
    print()
    
    results = []
    
    # Test 1: OAuth Token
    result1 = await test_oauth_token()
    results.append(("OAuth Token Retrieval", result1))
    
    if not result1:
        print_error("\nCannot proceed without OAuth token. Please check your credentials.")
        return 1
    
    # Test 2: Company Search
    result2 = await test_company_search(args.business_number)
    results.append(("Company Search", result2))
    
    # Test 3: Company Verification
    result3 = await test_company_verification(args.business_number, args.company_name)
    results.append(("Company Verification", result3))
    
    # Test 4: API Endpoints (optional)
    if not args.skip_endpoints:
        result4 = await test_api_endpoints(args.base_url, args.business_number)
        results.append(("API Endpoints", result4))
    
    # Summary
    print_header("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print_success("All tests passed!")
        return 0
    else:
        print_warning(f"{total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)







