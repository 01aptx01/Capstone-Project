"""
auth_otp.py — OTP authentication stubs (SMS integration pending).
"""

from flask import Blueprint, jsonify, request

auth_otp_api = Blueprint("auth_otp_api", __name__)


@auth_otp_api.route("/api/auth/otp/send", methods=["POST"])
def send_otp():
    # TODO: integrate SMS provider
    _ = request.get_json(silent=True)
    return jsonify({"status": "not_implemented", "message": "OTP send not implemented yet"}), 501


@auth_otp_api.route("/api/auth/otp/verify", methods=["POST"])
def verify_otp():
    # TODO: verify OTP code
    _ = request.get_json(silent=True)
    return jsonify({"status": "not_implemented", "message": "OTP verify not implemented yet"}), 501
