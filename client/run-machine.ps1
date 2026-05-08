param (
    [Parameter(Mandatory=$true)]
    [int]$Index,
    [switch]$RemoteUI # Use this if the Pi/Client is low-resource and should use the Server's UI
)

# Paths
$ROOT_DIR = (Get-Item -Path "$PSScriptRoot/.." ).FullName

# 1. Configuration (HARDCODED FOR PC SIMULATION RELIABILITY)
$SERVER_IP = "192.168.1.44"
$SERVER_URL = "http://$SERVER_IP:8000"
$SERVER_UI_URL = "http://$SERVER_IP:3000"

# Calculate Ports
$PORT_AGENT = 5000 + $Index

# Determine Machine Identity
$MACHINE_ID = "MP1-$(($Index).ToString('000'))"
$MACHINE_CODE = $MACHINE_ID

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting Vending Machine #$Index (PC Sim) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Machine ID: $MACHINE_ID"
Write-Host " Agent Port: $PORT_AGENT"
Write-Host " Server API: $SERVER_URL"
Write-Host " Server UI:  $SERVER_UI_URL"
Write-Host "=========================================="

# Paths
$AGENT_DIR = Join-Path $PSScriptRoot "agent"
$VENV_DIR = Join-Path $ROOT_DIR ".venv"
$PYTHON_EXE = Join-Path $VENV_DIR "Scripts/python.exe"

# 1. Auto-Setup Virtual Environment for Agent
if (-not (Test-Path $VENV_DIR)) {
    Write-Host "[-] Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv $VENV_DIR
}

# Ensure dependencies are installed (Using SIM requirements for PC)
Write-Host "[*] Checking Agent dependencies (SIM mode)..." -ForegroundColor Gray
& $PYTHON_EXE -m pip install -r (Join-Path $AGENT_DIR "requirements-sim.txt") --quiet

# Prompt for Token
$MACHINE_TOKEN = Read-Host "Enter MACHINE_TOKEN (from Admin UI)"

# 2. Start Agent in a new window
$UI_TARGET = "$SERVER_UI_URL/?machine_code=$MACHINE_CODE"

$AgentCommand = @"
cd '$AGENT_DIR'
`$env:MACHINE_ID = '$MACHINE_ID'
`$env:MACHINE_CODE = '$MACHINE_CODE'
`$env:MACHINE_TOKEN = '$MACHINE_TOKEN'
`$env:AGENT_PORT = $PORT_AGENT
`$env:SERVER_SOCKET_URL = '$SERVER_URL'
`$env:SERVER_URL = '$SERVER_URL'
`$env:MACHINE_UI_URL = '$UI_TARGET'
`$env:AGENT_DB_PATH = 'agent_$Index.db'
`$env:NFC_AUTO_APPROVE = 'true'
& '$PYTHON_EXE' agent.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $AgentCommand -WindowStyle Normal

# 3. Start Machine UI (Local mode only)
if (-not $RemoteUI) {
    $UICommand = @"
cd '$UI_DIR'
`$env:PORT = $PORT_UI
`$env:NEXT_PUBLIC_MACHINE_CODE = '$MACHINE_CODE'
`$env:NEXT_PUBLIC_API_URL = '$SERVER_URL'
`$env:NEXT_PUBLIC_AGENT_BASE_URL = 'http://localhost:$PORT_AGENT'
`$env:NEXT_PUBLIC_OMISE_PUBLIC_KEY = '$NEXT_PUBLIC_OMISE_PUBLIC_KEY'
npm run dev
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $UICommand -WindowStyle Normal
}

Write-Host "------------------------------------------"
Write-Host " [Success] Machine components are launching in separate windows." -ForegroundColor Green
Write-Host " UI Target: $UI_TARGET"
Write-Host " Agent API: http://localhost:$PORT_AGENT"
Write-Host "------------------------------------------"
