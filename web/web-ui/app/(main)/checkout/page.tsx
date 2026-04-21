// app/(main)/checkout/page.tsx
"use client"
import { QRCodeSVG } from "qrcode.react"
import { useCartStore } from "@/store/useCartStore"

export default function CheckoutPage() {
  const { items, total } = useCartStore()
  const orderId = `ORDER-${Date.now()}`  // TODO: ดึงจาก API

  const qrData = JSON.stringify({ orderId, total: total() })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
      <h2 className="text-xl font-bold">สแกนที่ตู้เพื่อชำระเงิน</h2>

      <QRCodeSVG value={qrData} size={220} />

      <p className="text-gray-500 text-sm">Order ID: {orderId}</p>
      <p className="text-primary font-bold text-xl">รวม {total()} บาท</p>

      <ul className="w-full text-sm space-y-1">
        {items.map((item) => (
          <li key={item.menuItem.id} className="flex justify-between">
            <span>{item.menuItem.name} x{item.quantity}</span>
            <span>{item.menuItem.price * item.quantity} ฿</span>
          </li>
        ))}
      </ul>
    </div>
  )
}