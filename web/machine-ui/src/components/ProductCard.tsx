"use client";
import Image from 'next/image';
import { Timer } from 'lucide-react';

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
}

export default function ProductCard({ name, desc, price, heatingTime, image, category, stock, onAdd }: Props) {
    // Map category to a readable Thai label
    const categoryLabel =
        category === 'sweet' ? 'ของหวาน' :
            category === 'meat' ? 'เนื้อสัตว์' :
                category === 'vegetarian' ? 'มังสวิรัติ' : '';

    return (
        <div className="product-card">
            <div className="product-image">
                <Image
                    src={image}
                    alt={name}
                    width={110}
                    height={110}
                    style={{ objectFit: 'cover' }}
                    priority
                />
                {categoryLabel && (
                    <div className={`category-badge category-${category || 'meat'}`}>
                        {categoryLabel}
                    </div>
                )}
            </div>
            <div className="product-title">{name}</div>
            <div className="product-desc">{desc}</div>
            <div className="heating-info">
                <Timer size={14} /> อุ่น {heatingTime} วินาที
            </div>
            {stock > 0 ? (
                <div className="product-price">{price} <span>฿</span></div>
            ) : (
                <div className="product-price" style={{ color: '#94a3b8', fontSize: 18 }}>สินค้าหมด</div>
            )}
            {/* {stock > 0 && stock <= 5 && (
                <div className="low-stock-text">เหลือ {stock} ชิ้น</div>
            )}*/}
            <button className="add-btn" onClick={stock > 0 ? onAdd : () => { }} style={{ backgroundColor: stock > 0 ? '#f89025' : '#ccc' }}>+ เพิ่มลงตะกร้า</button>
        </div >
    );
}