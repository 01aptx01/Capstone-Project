#!/bin/bash
# รอให้ Web UI รันเสร็จก่อน 10 วินาที
sleep 10 

# สั่งเปิด Chromium ในโหมด Kiosk ชี้ไปที่เว็บ UI ของเรา
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  --incognito \
  "http://localhost:3000"