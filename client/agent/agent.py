from flask import Flask
from routes import routes
# import machine  # โหลด machine ขึ้นมาทำงานตอนเปิดโปรแกรม

app = Flask(__name__)
app.register_blueprint(routes)

if __name__ == "__main__":
    print("Starting Vending Machine Hardware Agent...")
    # เคลียร์ไฟ LED ตอนเริ่มระบบ
    # machine.set_rgb(0,0,0) 
    app.run(host="0.0.0.0", port=5000)