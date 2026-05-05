"use client";
import { Product } from './ProductCard';
import { ShoppingCart, Trash2, TicketPercent, Timer } from 'lucide-react';
import type { AppliedCoupon } from './CouponModal';

export interface CartItem extends Product {
  qty: number;
}

interface Props {
  cart: CartItem[];
  /** Current catalog stock by product_id (from GET /api/products) */
  stockById: Record<number, number>;
  totalPrice: number;
  /** Amount to charge after coupon (same as totalPrice when no coupon) */
  payableTotal: number;
  appliedCoupon: AppliedCoupon | null;
  totalHeatingTime: number;
  onCheckout: () => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
  onOpenInfo: () => void;
  onOpenContact: () => void;
  onOpenCoupon: () => void;
  onRemoveCoupon: () => void;
}

export default function CartSidebar({ cart, stockById, totalPrice, payableTotal, appliedCoupon, totalHeatingTime, onCheckout, onIncrease, onDecrease, onRemove, onOpenInfo, onOpenContact, onOpenCoupon, onRemoveCoupon }: Props) {
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

        {appliedCoupon && (
          <div className="total-row" style={{ borderBottom: 'none', paddingBottom: 4 }}>
            <div className="total-label">คูปอง {appliedCoupon.code}</div>
            <div className="total-amount" style={{ color: '#16a34a' }}>-{appliedCoupon.discount_thb.toFixed(0)} <span>฿</span></div>
          </div>
        )}

        <div className="total-row">
          <div className="total-label">รวมทั้งหมด:</div>
          <div className="total-amount">
            {appliedCoupon ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '15px', marginRight: 8 }}>{totalPrice}</span>
                {payableTotal.toFixed(payableTotal % 1 === 0 ? 0 : 2)} <span>฿</span>
              </>
            ) : (
              <>{totalPrice} <span>฿</span></>
            )}
          </div>
        </div>

        {appliedCoupon && (
          <span className="coupon-remove-link" role="button" tabIndex={0} onClick={onRemoveCoupon} onKeyDown={(e) => e.key === 'Enter' && onRemoveCoupon()}>
            ยกเลิกคูปอง
          </span>
        )}

        <button
          className="checkout-btn"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          ชำระเงิน
        </button>
        <button type="button" className="preorder-btn" onClick={onOpenCoupon} disabled={cart.length === 0}>
          <TicketPercent size={20} /> {appliedCoupon ? "เปลี่ยนคูปอง" : "ใช้คูปอง"}
        </button>

        <a onClick={onOpenContact} style={{ cursor: 'pointer' }} className="contact-link">ติดต่อสอบถามเพิ่มเติม</a>
      </div>
    </div>
  );
};