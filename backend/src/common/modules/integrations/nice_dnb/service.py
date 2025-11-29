"""
Nice D&B API client service.

Handles communication with the Nice D&B Open API for company information
verification and search.

OAuth 2.0 Authentication:
- Uses Client Credentials Grant flow
- Documentation: https://openapi.nicednb.com/#/guide/common/oauth
"""
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from ...config.settings import settings
from ...logger import logger
from .schemas import NiceDnBResponse, NiceDnBCompanyData, NiceDnBFinancialData, NiceDnBInsight


class NiceDnBClient:
    """
    Nice D&B API client.

    Provides methods to search and verify company information using
    the Nice D&B Open API with OAuth 2.0 authentication.
    """

    def __init__(self):
        """Initialize Nice D&B API client."""
        self.api_key = settings.NICE_DNB_API_KEY
        self.api_secret_key = settings.NICE_DNB_API_SECRET_KEY
        # API base URL from official OpenAPI documentation: https://openapi.nicednb.com/#/
        # OAuth documentation: https://openapi.nicednb.com/#/guide/common/oauth
        self.base_url = settings.NICE_DNB_API_URL or "https://openapi.nicednb.com"
        self.timeout = 30.0  # Request timeout in seconds
        
        # OAuth token cache
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    def _is_configured(self) -> bool:
        """Check if API key and secret key are configured."""
        return (
            self.api_key is not None
            and self.api_key != ""
            and self.api_secret_key is not None
            and self.api_secret_key != ""
        )

    async def _get_access_token(self) -> Optional[str]:
        """
        Get OAuth 2.0 access token using Client Credentials Grant flow.
        
        Implements token caching to avoid unnecessary token requests.
        Token is refreshed if expired or about to expire within 5 minutes.
        
        Returns:
            Access token string, or None if authentication fails
            
        Reference:
            OAuth documentation: https://openapi.nicednb.com/#/guide/common/oauth
        """
        # Check if we have a valid cached token
        if (
            self._access_token
            and self._token_expires_at
            and datetime.now() < (self._token_expires_at - timedelta(minutes=5))
        ):
            return self._access_token
        
        if not self._is_configured():
            logger.warning(
                "Nice D&B API key or secret key is not configured. Cannot get access token."
            )
            return None
        
        try:
            # OAuth 2.0 Client Credentials Grant
            # Token endpoint: typically /oauth/token or /oauth2/token
            # Note: Actual endpoint path may vary - check API documentation
            token_url = f"{self.base_url}/oauth/token"
            # Alternative common paths:
            # - f"{self.base_url}/oauth2/token"
            # - f"{self.base_url}/api/oauth/token"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # OAuth 2.0 Client Credentials Grant request
                # Using form-encoded data as per OAuth 2.0 spec
                response = await client.post(
                    token_url,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.api_key,
                        "client_secret": self.api_secret_key,
                    },
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                    },
                )
                response.raise_for_status()
                
                token_data = response.json()
                
                # Extract access token and expiration
                self._access_token = token_data.get("access_token")
                
                # Calculate expiration time
                expires_in = token_data.get("expires_in", 3600)  # Default to 1 hour
                self._token_expires_at = datetime.now() + timedelta(seconds=expires_in)
                
                logger.info("Successfully obtained Nice D&B OAuth access token")
                return self._access_token
                
        except httpx.HTTPStatusError as e:
            logger.error(
                f"Nice D&B OAuth token request failed with status {e.response.status_code}: {e.response.text}",
                exc_info=True,
            )
            return None
        except httpx.RequestError as e:
            logger.error(
                f"Nice D&B OAuth token request failed: {str(e)}",
                exc_info=True,
            )
            return None
        except Exception as e:
            logger.error(
                f"Unexpected error getting Nice D&B OAuth token: {str(e)}",
                exc_info=True,
            )
            return None
    
    def _get_headers(self, access_token: Optional[str] = None) -> Dict[str, str]:
        """
        Get HTTP headers for API requests with OAuth 2.0 Bearer token.
        
        Args:
            access_token: OAuth access token. If not provided, will attempt to use cached token.
        
        Returns:
            Dictionary of HTTP headers
        """
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        elif self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"
        
        return headers

    async def search_company(
        self, business_number: str
    ) -> Optional[NiceDnBResponse]:
        """
        Search for company information by business registration number.

        Args:
            business_number: Business registration number (사업자등록번호)

        Returns:
            NiceDnBResponse if successful, None if API is not configured or request fails

        Raises:
            Exception: If API call fails and error handling is needed
        """
        if not self._is_configured():
            logger.warning(
                "Nice D&B API key or secret key is not configured. Skipping API call."
            )
            return None

        # Clean business number (remove hyphens if present)
        business_number = business_number.replace("-", "").strip()

        if not business_number:
            logger.error("Business number is required for Nice D&B search")
            return None

        try:
            # Get OAuth access token
            access_token = await self._get_access_token()
            if not access_token:
                logger.error("Failed to obtain OAuth access token for Nice D&B API")
                return None
            
            # TODO: Update endpoint path based on actual API documentation
            # This is a placeholder endpoint - check OpenAPI docs for correct path
            url = f"{self.base_url}/v1/companies/{business_number}"
            # Alternative endpoint patterns to check:
            # - f"{self.base_url}/api/v1/companies/{business_number}"
            # - f"{self.base_url}/companies/{business_number}"
            # - f"{self.base_url}/api/company/search?business_number={business_number}"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(access_token),
                )
                response.raise_for_status()

                data = response.json()

                # TODO: Map actual API response to our schema
                # The actual response structure will depend on Nice D&B API documentation
                return self._parse_response(data, business_number)

        except httpx.HTTPStatusError as e:
            logger.error(
                f"Nice D&B API returned error status {e.response.status_code}: {e.response.text}",
                exc_info=True,
            )
            return None
        except httpx.RequestError as e:
            logger.error(
                f"Nice D&B API request failed: {str(e)}", exc_info=True
            )
            return None
        except Exception as e:
            logger.error(
                f"Unexpected error calling Nice D&B API: {str(e)}",
                exc_info=True,
            )
            return None

    def _parse_response(
        self, api_data: Dict[str, Any], business_number: str
    ) -> NiceDnBResponse:
        """
        Parse API response into NiceDnBResponse schema.

        Args:
            api_data: Raw API response data
            business_number: Business registration number used in the query

        Returns:
            Parsed NiceDnBResponse object

        Note:
            This method needs to be updated based on the actual Nice D&B API
            response structure. Currently provides a basic mapping structure.
        """
        # TODO: Update this mapping based on actual API response structure
        # The following is a template that should be adjusted to match the real API

        # Extract company basic information
        company_data = NiceDnBCompanyData(
            business_number=business_number,
            company_name=api_data.get("company_name") or api_data.get("name") or "",
            representative=api_data.get("representative") or api_data.get("ceo"),
            address=api_data.get("address") or api_data.get("location"),
            industry=api_data.get("industry") or api_data.get("sector"),
            established_date=self._parse_date(
                api_data.get("established_date") or api_data.get("founding_date")
            ),
            credit_grade=api_data.get("credit_grade") or api_data.get("rating"),
            risk_level=api_data.get("risk_level") or api_data.get("risk"),
            summary=api_data.get("summary") or api_data.get("evaluation"),
        )

        # Extract financial data
        financials = []
        financial_list = api_data.get("financials") or api_data.get("financial_data") or []
        for financial in financial_list:
            financials.append(
                NiceDnBFinancialData(
                    year=financial.get("year") or financial.get("fiscal_year"),
                    revenue=financial.get("revenue") or financial.get("sales") or 0,
                    profit=financial.get("profit") or financial.get("net_income") or 0,
                    employees=financial.get("employees") or financial.get("employee_count") or 0,
                )
            )

        # Extract insights
        insights = []
        insights_list = api_data.get("insights") or api_data.get("metrics") or []
        for insight in insights_list:
            insights.append(
                NiceDnBInsight(
                    label=insight.get("label") or insight.get("name"),
                    value=insight.get("value") or str(insight.get("value", "")),
                    trend=insight.get("trend") or "steady",
                )
            )

        return NiceDnBResponse(
            success=True,
            data=company_data,
            financials=financials,
            insights=insights,
        )

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime.date]:
        """
        Parse date string to date object.

        Args:
            date_str: Date string in various formats

        Returns:
            Parsed date object or None if parsing fails
        """
        if not date_str:
            return None

        # Try common date formats
        date_formats = [
            "%Y-%m-%d",
            "%Y/%m/%d",
            "%Y.%m.%d",
            "%Y%m%d",
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        logger.warning(f"Could not parse date string: {date_str}")
        return None

    async def verify_company(
        self, business_number: str, company_name: Optional[str] = None
    ) -> bool:
        """
        Verify if a company exists and matches the provided information.

        Args:
            business_number: Business registration number
            company_name: Optional company name to verify against

        Returns:
            True if company is verified, False otherwise
        """
        response = await self.search_company(business_number)
        if not response or not response.success:
            return False

        if company_name:
            # Case-insensitive comparison
            return (
                response.data.company_name.lower().strip()
                == company_name.lower().strip()
            )

        return True


# Global client instance
nice_dnb_client = NiceDnBClient()

