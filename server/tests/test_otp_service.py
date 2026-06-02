# server/tests/test_otp_service.py
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import os
import sys

# Ensure server/ directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set default env values before importing services
os.environ["OTP_TTL_SECONDS"] = "300"
os.environ["AUTH_DEV_BYPASS"] = "0"
os.environ["OTP_HASH_SALT"] = "modpao-otp"

from app.services.otp_service import send_otp, verify_otp, OtpError, _hash_code
from app.services.sms_service import phone_to_e164


class TestOtpService(unittest.TestCase):

    @patch("app.services.otp_service.get_db_cursor")
    @patch("app.services.otp_service.get_sms_service")
    def test_send_otp_success(self, mock_get_sms, mock_get_db):
        """Test sending OTP successfully to a valid Thai phone number."""
        # Mock SMS service
        mock_sms = MagicMock()
        mock_sms.send.return_value = "console"
        mock_get_sms.return_value = mock_sms

        # Mock DB context manager
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        # Execute
        result = send_otp("0812345678")

        # Verify
        self.assertEqual(result["status"], "sent")
        self.assertEqual(result["expires_in"], 300)
        self.assertEqual(result["delivery"], "console")
        
        # Verify SMS send call
        mock_sms.send.assert_called_once()
        args, _ = mock_sms.send.call_args
        self.assertEqual(args[0], "+66812345678")  # Converted to E.164
        self.assertIn("MOD PAO: รหัส OTP ของคุณคือ", args[1])

        # Verify DB calls
        self.assertEqual(mock_cur.execute.call_count, 2)
        mock_conn.commit.assert_called_once()

    def test_send_otp_invalid_phone(self):
        """Test sending OTP to an invalid phone number length."""
        with self.assertRaises(OtpError) as context:
            send_otp("081234567")  # 9 digits only

        self.assertEqual(context.exception.code, "invalid_phone")
        self.assertEqual(context.exception.status, 400)

    def test_phone_to_e164_conversions(self):
        """Test E.164 phone conversion cases and identify the frontend slicing bug."""
        # Case 1: Standard Thai local format
        self.assertEqual(phone_to_e164("0812345678"), "+66812345678")

        # Case 2: Frontend-sliced format (+66812345678 sliced to 10 digits -> "6681234567")
        # Let's verify that this format raises a ValueError as expected!
        with self.assertRaises(ValueError) as context:
            phone_to_e164("6681234567")
        
        self.assertEqual(str(context.exception), "Invalid Thai phone number")

    @patch("app.services.otp_service.get_sms_service")
    @patch("app.services.otp_service.get_db_cursor")
    @patch("app.services.otp_service.time.monotonic")
    def test_send_otp_rate_limiting_cooldown(self, mock_time, mock_get_db, mock_get_sms):
        """Test that sending OTP too quickly triggers cooldown rate limit."""
        from app.services.otp_service import _send_buckets
        
        # Clear buckets for this test
        _send_buckets.clear()

        # Mock SMS service
        mock_sms = MagicMock()
        mock_sms.send.return_value = "console"
        mock_get_sms.return_value = mock_sms

        # Mock DB
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        # Mock monotonic time: simulate two rapid sends within the cooldown window (60s)
        mock_time.side_effect = [100.0, 120.0]

        # Send first time
        send_otp("0987654321")

        # Send second time within 20s (less than 60s cooldown) -> should fail
        with self.assertRaises(OtpError) as context:
            send_otp("0987654321")

        self.assertEqual(context.exception.code, "cooldown")
        self.assertEqual(context.exception.status, 429)

    @patch("app.services.otp_service.get_db_cursor")
    def test_verify_otp_success(self, mock_get_db):
        """Test verifying OTP successfully with correct details."""
        phone = "0812345678"
        code = "123456"
        code_hash = _hash_code(phone, code)

        # Mock DB returns a valid OTP session
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {
            "id": 42,
            "code_hash": code_hash,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "verified_at": None,
            "failed_attempts": 0
        }
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        # Execute
        result = verify_otp(phone, code)

        # Verify
        self.assertEqual(result, phone)
        mock_conn.commit.assert_called_once()

    @patch("app.services.otp_service.get_db_cursor")
    def test_verify_otp_wrong_code(self, mock_get_db):
        """Test verifying OTP with a mismatching code."""
        phone = "0812345678"
        code = "123456"
        code_hash = _hash_code(phone, code)

        # Mock DB returns the session, but code_hash won't match "wrong" code
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {
            "id": 42,
            "code_hash": code_hash,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "verified_at": None,
            "failed_attempts": 0
        }
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        with self.assertRaises(OtpError) as context:
            verify_otp(phone, "999999")  # Wrong code

        self.assertEqual(context.exception.code, "wrong_code")
        self.assertEqual(context.exception.status, 400)
        
        # Ensure that the failed_attempts counter was incremented in the DB
        mock_cur.execute.assert_called_with(
            "UPDATE otp_sessions SET failed_attempts = failed_attempts + 1 WHERE id = %s", (42,)
        )

    @patch("app.services.otp_service.get_db_cursor")
    def test_verify_otp_brute_force_block(self, mock_get_db):
        """Test that the system blocks verification after 5 failed attempts."""
        phone = "0812345678"
        code = "123456"
        code_hash = _hash_code(phone, code)

        # Mock DB returns a session that already has 5 failed attempts
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {
            "id": 42,
            "code_hash": code_hash,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "verified_at": None,
            "failed_attempts": 5
        }
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        with self.assertRaises(OtpError) as context:
            verify_otp(phone, code)  # Even if code is correct, it's blocked

        self.assertEqual(context.exception.code, "too_many_failed_attempts")
        self.assertEqual(context.exception.status, 400)


if __name__ == "__main__":
    unittest.main()
