// components/cards/MenuCard.tsx
"use client";

import { MenuItem } from "@/lib/constants";
import { BaoImage } from "./BaoImage";
import { COLORS } from "@/lib/constants";
import { useCart } from "@/context/CartContext";

export function MenuCard({ item }: { item: MenuItem }) {
  // 🚨 ดึงข้อมูลตะกร้า และฟังก์ชันจัดการตะกร้ามาใช้
  const { cartItems, addToCart, updateQty, removeItem } = useCart(); 

  // 🚨 เช็คว่าสินค้านี้อยู่ในตะกร้าหรือยัง และมีกี่ชิ้น
  const cartItem = cartItems.find((c) => c.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ส่งข้อมูลทั้งหมดของสินค้าชิ้นนั้นเข้าไปในตะกร้า
    addToCart(e, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || "", 
    }); 
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="h-44 w-full overflow-hidden">
        <BaoImage item={item} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
        <p className="text-sm mt-0.5" style={{ color: COLORS.gray }}>
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg" style={{ color: COLORS.accent }}>
            {item.price} ฿
          </span>

          {/* 🚨 สลับ UI ตามจำนวนในตะกร้า */}
          {qty > 0 ? (
            // 🟢 UI แบบใหม่: สไตล์มินิมอล ขอบเทาอ่อน พื้นขาว ตัวเลขดำ ปุ่มสีส้มตอน Hover
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-1.5 py-1 w-[100px] shadow-sm animate-fade-in">
              <button
                onClick={() => qty === 1 ? removeItem(item.id) : updateQty(item.id, -1)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 font-bold text-xl hover:text-[#FF8A33] hover:bg-orange-50 rounded-full transition-colors active:scale-90"
              >
                -
              </button>
              <span className="font-extrabold text-sm text-gray-800 w-6 text-center">{qty}</span>
              <button
                onClick={handleAdd}
                className="w-7 h-7 flex items-center justify-center text-gray-400 font-bold text-xl hover:text-[#FF8A33] hover:bg-orange-50 rounded-full transition-colors active:scale-90"
              >
                +
              </button>
            </div>
          ) : (
            // 🟠 ปุ่มสั่งซื้อปกติ (โชว์เมื่อยังไม่มีของในตะกร้า)
            <button
              onClick={handleAdd}
              className="px-5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: COLORS.accent,
                borderColor: COLORS.accent,
                color: "white",
              }}
            >
              สั่งซื้อ
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
}