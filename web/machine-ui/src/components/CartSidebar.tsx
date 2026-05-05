"use client";
import { Product } from './ProductCard';
import { ShoppingCart, Trash2, TicketPercent, Timer } from 'lucide-react';

export interface CartItem extends Product {
  qty: number;
}

interface Props {
  cart: CartItem[];
  /** Current catalog stock by product_id (from GET /api/products) */
  stockById: Record<number, number>;
  totalPrice: number;
  totalHeatingTime: number;
  onCheckout: () => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
  onOpenInfo: () => void;
  onOpenContact: () => void;
}

export default function CartSidebar({ cart, stockById, totalPrice, totalHeatingTime, onCheckout, onIncrease, onDecrease, onRemove, onOpenInfo, onOpenContact }: Props) {
  return (
    <div className="sidebar">
      <button className="info-btn" onClick={onOpenInfo}>i</button>

      <div className="cart-content-area">
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-icon">
              <ShoppingCart size={50} />
            </div>
            <div className="cart-empty-text">ตะกร้าว่าง</div>
          </div>
        ) : (
          <div className="cart-item-list">
            {cart.map((item) => {
              const liveStock = stockById[item.id] ?? item.stock ?? 0;
              const atSkuCap = item.qty >= liveStock;
              const disablePlus = atSkuCap;
              return (
              <div className="cart-item-row" key={item.id}>
                {/* บรรทัดบน: ชื่อ และ ราคารวมของสินค้านั้น */}
                <div className="cart-item-main">
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{item.name}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#333' }}>
                    {item.price * item.qty} <span>฿</span>
                  </div>
                </div>

                {/* บรรทัดล่าง: ปุ่มจัดการจำนวน และ ปุ่มลบ */}
                <div className="cart-item-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="qty-controls">
                      <button className="btn-qty" onClick={() => onDecrease(item.id)}>-</button>
                      <span className="qty-val">{item.qty}</span>
                      <button
                        className="btn-qty"
                        onClick={() => onIncrease(item.id)}
                        disabled={disablePlus}
                        style={{ opacity: disablePlus ? 0.45 : 1 }}
                      >+</button>
                    </div>
                    {liveStock > 0 && liveStock <= 3 && (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>สินค้าคงเหลือ {liveStock} ชิ้น</span>
                    )}
                  </div>
                  <button className="btn-remove" onClick={() => onRemove(item.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      <div className="summary-section">
        {totalHeatingTime > 0 && (
          <div className="total-row" style={{ borderBottom: 'none', paddingBottom: 0, color: '#f89025' }}>
            <div className="total-label"><Timer size={20} /> เวลารอประมาณ:</div>
            <div className="total-amount">
              {Math.floor(totalHeatingTime / 60) > 0 && `${Math.floor(totalHeatingTime / 60)} นาที `}
              {totalHeatingTime % 60} วินาที
            </div>
          </div>
        )}

        <div className="total-row">
          <div className="total-label">รวมทั้งหมด:</div>
          <div className="total-amount">{totalPrice} <span>฿</span></div>
        </div>

        <button
          className="checkout-btn"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          ชำระเงิน
        </button>
        <button className="preorder-btn">
          <TicketPercent size={20} /> ใช้คูปอง
        </button>

        <a onClick={onOpenContact} style={{ cursor: 'pointer' }} className="contact-link">ติดต่อสอบถามเพิ่มเติม</a>
      </div>
    </div>
  );
};