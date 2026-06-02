// lib/api/products.ts
// ─── PRODUCTS API WRAPPER ────────────────────────────────────────────────────
// ฟังก์ชันสำหรับเรียกใช้งานข้อมูลสินค้าจากตู้สินค้าอัจฉริยะ (Vending Machine Catalog)

import { apiFetch } from "./client";

// ─── Interfaces ──────────────────────────────────────────────────────────────

// รายละเอียดสินค้าที่ส่งคืนจาก Backend API
export interface ApiProduct {
  product_id: number;               // รหัสสินค้า
  name: string;                     // ชื่อสินค้า (ภาษาไทย)
  description: string;              // รายละเอียดสินค้า/ข้อมูลส่วนผสม
  price: number;                    // ราคาสินค้า (บาท)
  heating_time: number;             // ระยะเวลาในการอุ่นร้อนของตู้ (วินาที)
  image_url: string | null;         // ลิงก์รูปภาพสินค้าจริง (null หากใช้รูปดีฟอลต์)
  category: string;                 // หมวดหมู่สินค้า เช่น pork, veggie, sweet
  stock: number;                    // จำนวนสินค้าคงเหลือในตู้
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * fetchProducts
 * ดึงรายการสินค้าทั้งหมดที่มีของตู้ขายของอัจฉริยะเครื่องที่กำหนด (ดึงจาก Machine Code)
 */
export async function fetchProducts(
  machineCode: string,
): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(
    `/api/products?machine_code=${encodeURIComponent(machineCode)}`,
  );
}

/**
 * fetchProductDetail
 * ดึงรายละเอียดเจาะลึกของสินค้าตัวที่กำหนด (ระบุด้วยรหัสสินค้า Product ID)
 */
export async function fetchProductDetail(productId: number): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/products/${productId}`);
}
