require('dotenv').config();
const express = require('express');
const cors = require('cors');
const omise = require('omise')({
    publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY
});

const app = express();
app.use(cors());
app.use(express.json());

const mockDatabase = {};

// ----------------------------------------------------
// API 1: สร้าง QR Code และ จำลองการแตะบัตรผ่าน Omise API
// ----------------------------------------------------
app.post('/api/buy/checkout', async (req, res) => {
    const { payment_type, payment_id, amount, card_brand } = req.body;
    console.log(`[POST] ขอสร้างรายการชำระเงินแบบ: ${payment_type} ยอด: ${amount / 100} บาท`);

    try {
        if (payment_type === 'promptpay') {
            console.log(`📱 [PromptPay] กำลังสร้าง QR Code จาก Omise...`);

            // สร้าง Charge และ Source (PromptPay) พร้อมกันในคำสั่งเดียว
            const charge = await omise.charges.create({
                amount: amount,
                currency: 'thb',
                source: {
                    type: 'promptpay'
                }
            });

            // 💡 1. เซ็ตสถานะเริ่มต้นให้เป็น 'PENDING' (รอดำเนินการ)
            mockDatabase[charge.id] = 'PENDING';

            res.json({
                charge_id: charge.id,
                qr_code: charge.source.scannable_code.image.download_uri
            });

        } else if (payment_type === 'nfc_mock') {
            console.log(`💳 [NFC] อ่านข้อมูลบัตรจำลอง (${card_brand.toUpperCase()}) สำเร็จ กำลังเชื่อมต่อ Omise...`);

            // 💡 กำหนดเลขบัตรทดสอบตามประเภทค่ายบัตรที่ลูกค้าเลือก
            let testCardNumber = "4242424242424242"; // Default เป็น VISA

            if (card_brand === 'mastercard') {
                testCardNumber = "5454545454545454"; // เลขทดสอบของ Mastercard
            } else if (card_brand === 'unionpay') {
                testCardNumber = "6221260000000000"; // เลขทดสอบของ UnionPay
            }

            try {
                // 1. สร้าง Token โดยใช้ "บัตรเครดิตทดสอบ (Test Card)" ของ Omise
                const token = await omise.tokens.create({
                    card: {
                        name: "MOD PAO Customer",
                        number: testCardNumber,
                        expiration_month: 12,
                        expiration_year: 2028,
                        security_code: 123
                    }
                });

                console.log(`💳 [NFC] ได้รับ Token: ${token.id} -> กำลังสั่งตัดเงิน...`);

                // 2. นำ Token ที่ได้ ไปสร้างรายการตัดเงิน (Charge) ทันที
                const charge = await omise.charges.create({
                    amount: amount,
                    currency: 'thb',
                    card: token.id // ใช้ Token แทน Source
                });

                // 3. ตรวจสอบสถานะการตัดบัตร
                if (charge.status === 'successful') {
                    console.log(`✅ [NFC] ตัดเงินผ่าน Omise สำเร็จ! (Charge ID: ${charge.id})`);
                    res.json({
                        charge_id: charge.id,
                        status: 'successful'
                    });
                } else {
                    console.log(`⚠️ [NFC] สถานะการตัดเงิน: ${charge.status}`);
                    res.status(400).json({ error: `Charge status: ${charge.status}` });
                }

            } catch (omiseError) {
                console.error("❌ Omise NFC Error:", omiseError.message);
                res.status(500).json({ error: omiseError.message });
            }
        }
    } catch (error) {
        console.error("❌ Omise Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ----------------------------------------------------
// API 2: จำลองการเช็คสถานะว่าลูกค้าโอนเงินหรือยัง (Polling)
// ----------------------------------------------------
app.get('/api/buy/status/:chargeId', (req, res) => {
    const chargeId = req.params.chargeId;

    // 💡 3. ไปดึงสถานะจาก Mock Database (ถ้าเพิ่งสร้างจะตอบ PENDING, ถ้าผ่านไป 15 วิจะตอบ PAID)
    const currentStatus = mockDatabase[chargeId] || 'PENDING';

    console.log(`[GET] เช็คสถานะ ${chargeId} -> ตอนนี้คือ: ${currentStatus}`);

    res.json({
        status: currentStatus
    });
});

// ----------------------------------------------------
// API 3: จำลองลูกค้าโอนเงิน PromptPay สำเร็จ (สำหรับปุ่ม Test)
// ----------------------------------------------------
app.post('/api/buy/mock-pay', (req, res) => {
    const { charge_id } = req.body;

    // ถ้าเจอรายการชาร์จนี้ในระบบ ให้บังคับเปลี่ยนเป็น PAID ทันที
    if (mockDatabase[charge_id]) {
        mockDatabase[charge_id] = 'PAID';
        console.log(`💰 [Mock Webhook] บังคับอัปเดตสถานะคิว ${charge_id} เป็น PAID เรียบร้อย!`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Charge ID not found' });
    }
});

// เปิดรันเซิร์ฟเวอร์ที่ Port 8000
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`✅ Mock Backend รันอยู่บน http://localhost:${PORT}`);
    console.log(`พร้อมรับการยิง API จาก Frontend เพื่อทดสอบ Omise แล้ว!`);
});