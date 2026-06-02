"use client";
import Image from 'next/image';
import { Timer } from 'lucide-react';
import { resolveProductImageSrc } from '../lib/resolve-product-image';

export interface Product {
    id: number;
    name: string;
    desc: string;
    price: number;
    heatingTime: number;
    image: string;
    category?: 'meat' | 'vegetarian' | 'sweet';
    stock: number;
}

interface Props extends Product {
    onAdd: () => void;
    canAdd?: boolean;
}

// ProductCard Component
export default function ProductCard({ name, desc, price, heatingTime, image, category, stock, onAdd, canAdd = true }: Props) {
    const categoryLabel =
        category === 'sweet' ? 'ของหวาน' :
            category === 'meat' ? 'เนื้อสัตว์' :
                category === 'vegetarian' ? 'มังสวิรัติ' : '';

    return (
        <div className="product-card">
            {/* รูปภาพ */}
            <div className="product-image">
                <div className="product-image-media">
                    <Image
                        src={resolveProductImageSrc(image)}
                        alt={name}
                        fill
                        sizes="110px"
                        className="!object-cover !object-center"
                        unoptimized
                        priority
                    />
                </div>
                {categoryLabel && (
                    <div className={`category-badge category-${category || 'meat'}`}>
                        {categoryLabel}
                    </div>
                )}
            </div>

            {/* ชื่อสินค้า และ รายละเอียด */}
            <div className="product-title">{name}</div>
            <div className="product-desc">{desc}</div>

            {/* ระยะเวลาอุ่นร้อน */}
            <div className="heating-info">
                <Timer size={14} /> อุ่น {heatingTime} วินาที
            </div>

            {/* ราคาสินค้า */}
            {stock > 0 ? (
                <div className="product-price">{price} <span>฿</span></div>
            ) : (
                <div className="product-price" style={{ color: '#94a3b8', fontSize: 18 }}>สินค้าหมด</div>
            )}

            {/* ปุ่มกดสั่งซื้อ */}
            <button
                className="add-btn"
                onClick={stock > 0 && canAdd ? onAdd : () => { }}
                style={{ backgroundColor: stock > 0 && canAdd ? '#f89025' : '#ccc' }}
                disabled={stock <= 0 || !canAdd}
            >+ เพิ่มลงตะกร้า</button>
        </div >
    );
}
