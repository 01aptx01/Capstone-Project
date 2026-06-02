"""Email service — ส่งอีเมลผ่าน SMTP (stdlib).

ถ้ายังไม่ได้ตั้งค่า SMTP (ไม่มี SMTP_HOST) จะ "ไม่" ส่งจริง แต่ log ลิงก์ไว้
และคืน False เพื่อให้ flow ทำงานต่อได้ (dev mode — copy ลิงก์ไปส่งเองได้).

Env ที่เกี่ยวข้อง:
  SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASSWORD,
  SMTP_FROM (default = SMTP_USER), SMTP_USE_TLS (default true)
"""

import logging
import os
import smtplib
import ssl
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool((os.environ.get("SMTP_HOST") or "").strip())


def _send(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> bool:
    if not smtp_configured():
        logger.warning(
            f"📭 [Email] SMTP ยังไม่ได้ตั้งค่า — ไม่ได้ส่งอีเมลจริงไปที่ {to_email}. "
            f"เนื้อหา:\n{text_body}"
        )
        return False

    host = os.environ["SMTP_HOST"].strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = (os.environ.get("SMTP_USER") or "").strip() or None
    password = os.environ.get("SMTP_PASSWORD") or None
    sender = (os.environ.get("SMTP_FROM") or user or "no-reply@modpao.local").strip()
    use_tls = (os.environ.get("SMTP_USE_TLS", "true").strip().lower() in ("1", "true", "yes", "on"))

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            if use_tls:
                server.starttls(context=ssl.create_default_context())
            if user and password:
                server.login(user, password)
            server.send_message(msg)
        logger.info(f"📧 [Email] ส่งไปยัง {to_email} สำเร็จ ({subject})")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"❌ [Email] ส่งไป {to_email} ไม่สำเร็จ: {e}")
        return False


def send_admin_invite_email(to_email: str, invite_link: str) -> bool:
    """ส่งอีเมลคำเชิญผู้ดูแลระบบใหม่ — คืน True ถ้าส่งจริงสำเร็จ."""
    subject = "คำเชิญเป็นผู้ดูแลระบบ MOD PAO Admin"
    text_body = (
        "คุณได้รับเชิญให้เป็นผู้ดูแลระบบของ MOD PAO Admin\n\n"
        "กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งาน (ลิงก์หมดอายุใน 7 วัน):\n"
        f"{invite_link}\n\n"
        "หากคุณไม่ได้คาดหวังอีเมลนี้ กรุณาเพิกเฉย"
    )
    html_body = f"""\
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:auto">
  <h2 style="color:#f47b2a">MOD PAO Admin</h2>
  <p>คุณได้รับเชิญให้เป็น<strong>ผู้ดูแลระบบ</strong>ของ MOD PAO Admin</p>
  <p>กรุณาตั้งรหัสผ่านเพื่อเริ่มใช้งาน (ลิงก์หมดอายุใน 7 วัน):</p>
  <p style="margin:24px 0">
    <a href="{invite_link}"
       style="background:#f47b2a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:bold">
       ตั้งรหัสผ่าน &amp; เข้าใช้งาน
    </a>
  </p>
  <p style="color:#888;font-size:13px;word-break:break-all">{invite_link}</p>
</div>"""
    return _send(to_email, subject, text_body, html_body)
