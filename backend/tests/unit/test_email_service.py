import pytest
from unittest.mock import AsyncMock, patch

from src.common.modules.email.service import EmailService


@pytest.mark.asyncio
async def test_send_registration_confirmation_email_success():
    service = EmailService()
    with patch(
        "src.common.modules.email.service.aiosmtplib.send", new=AsyncMock()
    ) as mock_send:
        result = await service.send_registration_confirmation_email(
            to_email="test@example.com",
            company_name="테스트 기업",
            business_number="1234567890",
        )

    assert result is True
    mock_send.assert_awaited_once()


@pytest.mark.asyncio
async def test_send_password_reset_email_failure():
    service = EmailService()
    with patch(
        "src.common.modules.email.service.aiosmtplib.send",
        new=AsyncMock(side_effect=Exception("SMTP error")),
    ):
        result = await service.send_password_reset_email(
            to_email="foo@example.com",
            reset_token="reset-token",
            business_number="9876543210",
        )

    assert result is False


