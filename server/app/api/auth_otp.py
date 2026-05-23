"""
auth_otp.py — OTP send/verify for web-ui member login (Twilio SMS or console fallback).
"""

import logging

from flask import Blueprint, jsonify, request

from app.auth.member_auth import create_access_token
from app.services.otp_service import OtpError, send_otp, verify_otp

logger = logging.getLogger(__name__)
auth_otp_api = Blueprint("auth_otp_api", __name__)


def _validate_phone_body(data: dict) -> str:
    phone = (data.get("phone_number") or data.get("phone") or "").strip()
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) != 10:
        raise OtpError("invalid_phone", "เบอร์โทรต้องเป็นตัวเลข 10 หลัก", 400)
    return digits


@auth_otp_api.route("/api/auth/otp/send", methods=["POST"])
def send_otp_route():
    data = request.get_json(silent=True) or {}
    try:
        phone = _validate_phone_body(data)
        result = send_otp(phone)
        return jsonify(result), 200
    except OtpError as e:
        return jsonify({"error": e.code, "message": e.message}), e.status
    except Exception as e:
        logger.exception("[auth_otp] send failed")
        return jsonify({"error": "server_error", "message": "ส่ง OTP ไม่สำเร็จ"}), 500


@auth_otp_api.route("/api/auth/otp/verify", methods=["POST"])
def verify_otp_route():
    data = request.get_json(silent=True) or {}
    try:
        phone = _validate_phone_body(data)
        code = (data.get("code") or data.get("otp") or "").strip()
        verified_phone = verify_otp(phone, code)
        token = create_access_token(verified_phone)
        return jsonify(
            {
                "status": "verified",
                "access_token": token,
                "token_type": "Bearer",
                "phone_number": verified_phone,
            }
        ), 200
    except OtpError as e:
        return jsonify({"error": e.code, "message": e.message}), e.status
    except Exception as e:
        logger.exception("[auth_otp] verify failed")
        return jsonify({"error": "server_error", "message": "ยืนยัน OTP ไม่สำเร็จ"}), 500
