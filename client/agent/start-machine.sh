#!/bin/bash

# ==============================================================================
# One-Click Startup Script for Raspberry Pi Vending Machine
# ==============================================================================

# 1. Configuration (จะโหลดจากไฟล์ .env ถ้ามี)
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "--- First Time Setup ---"
    read -p "Enter MACHINE_ID (e.g., MP1-001): " MID
    read -p "Enter MACHINE_TOKEN (from Admin UI): " MTOKEN
    read -p "Enter SERVER_IP (e.g., 192.168.1.50): " SIP
    
    echo "MACHINE_ID=$MID" > "$ENV_FILE"
    echo "MACHINE_TOKEN=$MTOKEN" >> "$ENV_FILE"
    echo "SERVER_URL=http://$SIP:8000" >> "$ENV_FILE"
    echo "MACHINE_UI_URL=http://$SIP:3000" >> "$ENV_FILE"
    echo "AGENT_PORT=5000" >> "$ENV_FILE"
    echo "NFC_AUTO_APPROVE=true" >> "$ENV_FILE"
    echo "------------------------"
fi

# 2. Auto Virtual Environment
if [ ! -d ".venv" ]; then
    echo "[*] Creating virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate

# 3. Auto Install Dependencies (Check requirements.txt timestamp to speed up)
if [ -f "requirements.txt" ]; then
    echo "[*] Checking/Installing dependencies..."
    pip install -r requirements.txt --quiet
fi

# 4. Export Variables
export $(grep -v '^#' "$ENV_FILE" | xargs)
export DISPLAY=:0

# 5. Launch Agent (ซึ่งจะเปิด Browser ให้อัตโนมัติ)
echo "[*] Starting Vending Machine Agent ($MACHINE_ID)..."
python3 agent.py
