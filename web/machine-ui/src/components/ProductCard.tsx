"use client";
import React from 'react';
import Image from 'next/image';
import { Timer } from 'lucide-react';

export interface Product {
    id: number;
    name: string;
    desc: string;
    price: number;
    heatingTime: number;
    image: string;
}

interface Props extends Product {
    onAdd: () => void;
}

export default function ProductCard({ name, desc, price, heatingTime, image, onAdd }: Props) {
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
            </div>
            <div className="product-title">{name}</div>
            <div className="product-desc">{desc}</div>
            <div className="heating-info">
                <Timer size={14} /> อุ่น {heatingTime} วินาที
            </div>
            <div className="product-price">{price} ฿</div>
            <button className="add-btn" onClick={onAdd}>+ เพิ่มลงตะกร้า</button>
        </div >
    );
}