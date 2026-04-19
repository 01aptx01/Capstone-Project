import React from 'react';

const CartSidebar = ({ cart, totalPrice, onCheckout, onIncrease, onDecrease, onRemove, onOpenInfo }) => {
  return (
    <div className="sidebar">
      <button className="info-btn" onClick={onOpenInfo}>i</button>

      <div className="cart-content-area">
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-icon material-symbols-outlined">shopping_cart</div>
            <div className="cart-empty-text">ตะกร้าว่างๆ</div>
          </div>
        ) : (
          <div className="cart-item-list">
            {cart.map((item) => (
              <div className="cart-item-row" key={item.id}>
                {/* บรรทัดบน: ชื่อ และ ราคารวมของสินค้านั้น */}
                <div className="cart-item-main">
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{item.name}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#f47b2a' }}>
                    {item.price * item.qty} ฿
                  </div>
                </div>

                {/* บรรทัดล่าง: ปุ่มจัดการจำนวน และ ปุ่มลบ */}
                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button className="btn-qty" onClick={() => onDecrease(item.id)}>-</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="btn-qty" onClick={() => onIncrease(item.id)}>+</button>
                  </div>
                  <button className="btn-remove" onClick={() => onRemove(item.id)}>
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="summary-section">
        <div className="total-row">
          <div className="total-label">รวมทั้งหมด:</div>
          <div className="total-amount">{totalPrice} ฿</div>
        </div>

        <button
          className="checkout-btn"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          ชำระเงิน
        </button>
        <button className="preorder-btn">
          <span class="material-symbols-outlined">qr_code</span> สั่งอาหารล่วงหน้า
        </button>

        <a href="#" className="contact-link">ติดต่อสอบถามเพิ่มเติม</a>
      </div>
    </div>
  );
};

export default CartSidebar;