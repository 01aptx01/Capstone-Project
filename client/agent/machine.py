import time
import threading
import board
import busio
from adafruit_pca9685 import PCA9685
import pygame
from mfrc522 import SimpleMFRC522

# =================ตั้งค่า I2C สำหรับ PCA9685 (คุมไฟ LED)=================
i2c = busio.I2C(board.SCL, board.SDA)
pca = PCA9685(i2c)
pca.frequency = 60 # ความถี่สำหรับ LED

# กำหนดช่อง (Channel) บนบอร์ด PCA9685
# สมมติไฟ RGB หลักต่อที่ช่อง 0, 1, 2 (Red, Green, Blue)
RGB_PINS = {'R': 0, 'G': 1, 'B': 2}
# สมมติไฟสีเขียวแต่ละช่องสินค้า (Slot 1-4) ต่อที่ช่อง 4, 5, 6, 7
SLOT_LEDS = {1: 4, 2: 5, 3: 6, 4: 7}

# =================ตั้งค่าระบบเสียง (USB Speaker)=================
pygame.mixer.init()

# =================ตั้งค่า NFC Reader (RC522)=================
reader = SimpleMFRC522()

def play_sound(filename):
    """ฟังก์ชันเล่นเสียง (ต้องเอาไฟล์ .wav หรือ .mp3 ไปวางในโฟลเดอร์)"""
    try:
        pygame.mixer.music.load(f"sounds/{filename}")
        pygame.mixer.music.play()
    except Exception as e:
        print(f"Audio Error: {e}")

def set_rgb(r, g, b):
    """ฟังก์ชันปรับสีไฟ RGB (ค่า 0-255)"""
    # PCA9685 รับค่า duty cycle 0 - 65535
    pca.channels[RGB_PINS['R']].duty_cycle = int((r / 255.0) * 65535)
    pca.channels[RGB_PINS['G']].duty_cycle = int((g / 255.0) * 65535)
    pca.channels[RGB_PINS['B']].duty_cycle = int((b / 255.0) * 65535)

def set_slot_led(slot, is_on):
    """ฟังก์ชันเปิด/ปิดไฟสีเขียวประจำช่องสินค้า"""
    if slot in SLOT_LEDS:
        pin = SLOT_LEDS[slot]
        pca.channels[pin].duty_cycle = 65535 if is_on else 0

def process_dispense(slot):
    """Flow การทำงานหลัก: จำลองการอุ่นและจ่ายสินค้า"""
    print(f"--- เริ่มต้นกระบวนการช่องที่ {slot} ---")
    
    # 1. นำเข้าเตาอุ่น (สีฟ้า)
    set_rgb(0, 0, 255) 
    play_sound("entering_oven.wav")
    print("State 1: นำเข้าเตาอุ่น")
    time.sleep(2)
    
    # เปิดไฟสีเขียวที่ช่องสินค้านั้นๆ (บอกว่าช่องนี้กำลังทำงาน)
    set_slot_led(slot, True)

    # 2. กำลังอุ่น (สีส้ม/แดง)
    set_rgb(255, 50, 0)
    play_sound("warming.wav")
    print("State 2: กำลังอุ่น...")
    time.sleep(4) # จำลองเวลาอุ่น

    # 3. กำลังเสิร์ฟ (สีเหลือง)
    set_rgb(255, 255, 0)
    play_sound("serving.wav")
    print("State 3: กำลังเสิร์ฟ")
    time.sleep(2)

    # 4. พร้อมทาน (สีเขียว)
    set_rgb(0, 255, 0)
    play_sound("ready.wav")
    print("State 4: พร้อมทาน!")
    set_slot_led(slot, False) # ปิดไฟช่องสินค้า
    
    # หน่วงเวลาให้ลูกค้าหยิบ แล้วดับไฟ RGB
    time.sleep(3)
    set_rgb(0, 0, 0)

def wait_for_nfc_payment(price):
    """จำลองการแตะบัตรจ่ายเงิน (Blocking call)"""
    print(f"กรุณาแตะบัตรเพื่อชำระเงินจำนวน {price} บาท...")
    try:
        id, text = reader.read()
        print(f"อ่านบัตรสำเร็จ! ID: {id}")
        play_sound("payment_success.wav")
        return {"status": "success", "uid": id}
    finally:
        pass # ในระบบจริงอาจจะมีการเช็คยอดเงิน