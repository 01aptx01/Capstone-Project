from flask import Flask

app = Flask(__name__)

@app.route("/dispense/<int:slot>")
def dispense(slot):
    print(f"[PI] Dispensing slot {slot}")
    return {"status": "dispensed", "slot": slot}

@app.route("/health")
def health():
    return {"status": "pi-agent-ok"}

app.run(host="0.0.0.0", port=5000)