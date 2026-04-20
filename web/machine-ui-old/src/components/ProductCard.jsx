import React from 'react';

const ProductCard = ({ name, desc, price, image, onAdd }) => {
    return (
        <div className="product-card">
            <div className="product-image">
                <img 
                    src={image} 
                    alt={name} 
                />
            </div>
            <div className="product-title">{name}</div>
            <div className="product-desc">{desc}</div>
            <div className="product-price">{price} ฿</div>
            <button className="add-btn" onClick={onAdd}>+ เพิ่มลงตะกร้า</button>
        </div>
    );
};

export default ProductCard;