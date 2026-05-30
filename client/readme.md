# How to run on Raspberry Pi:
 1) `cd /home/klongyaa4/Desktop/Modpao/client/agent`
 2) `python3 -m venv .venv`
 3) `source .venv/bin/activate`
 4) `pip install -r requirements.txt`
 5) `export $(grep -v '^#' .env | xargs)` if you copy this file to .env
 6) `python agent.py`

> Optional standalone hardware controller: `python machine.py`