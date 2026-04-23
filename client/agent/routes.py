from flask import Blueprint, jsonify
import machine # นำเข้าไฟล์ที่เราเขียนคุมอุปกรณ์
import threading

routes = Blueprint("routes", __name__)

@routes.route("/dispense/<int:slot>")
def dispense(slot):
    print(f"API Triggered: Dispensing slot {slot}")
    
    # รัน Flow การอุ่นและจ่ายของใน Thread แยก เพื่อไม่ให้ API ค้าง (Timeout)
    t = threading.Thread(target=machine.process_dispense, args=(slot,))
    t.start()
    
    return jsonify({
        "status": "processing", 
        "message": f"Started dispensing process for slot {slot}",
        "slot": slot
    })

@routes.route("/mock-pay/<int:amount>")
def mock_pay(amount):
    """API สำหรับให้หน้าจอ UI เรียกใช้เพื่อรอการแตะบัตร"""
    # ฟังก์ชันนี้จะค้างรอจนกว่าจะมีการแตะบัตร
    result = machine.wait_for_nfc_payment(amount)
    return jsonify(result)