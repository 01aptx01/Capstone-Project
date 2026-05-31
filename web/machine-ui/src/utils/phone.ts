// displayFormattedPhone
// - จัดการจัดรูปแบบเบอร์โทรศัพท์ให้อ่านง่ายขึ้น
// - ตัวอย่างการแปลง:
//  - เบอร์ว่างเปล่า -> แสดงผลตัวอย่าง "xxx-xxxxxxx"
//  - กรอก 3 ตัวแรก -> ยังคงแสดงปกติ (เช่น "081")
//  - กรอกตัวที่ 4 ขึ้นไป -> เติมขีดกลางคั่นระหว่างตัวที่ 3 และตัวที่ 4 (เช่น "081-2345678")
export function displayFormattedPhone(phoneNumber: string): string {
  if (!phoneNumber) return "xxx-xxxxxxx";
  if (phoneNumber.length > 3) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return phoneNumber;
}