"use client";

import { useState } from "react";

export default function SecurityView() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="security-view animate-in">
      <div className="security-header">
        <h1>ความปลอดภัย</h1>
        <p>จัดการการตั้งค่าความปลอดภัยและการเข้าถึงบัญชีของคุณ</p>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-key"></i></div>
            <div className="title-box">
              <h3>เปลี่ยนรหัสผ่าน</h3>
              <p>เราขอแนะนำให้คุณใช้รหัสผ่านที่รัดกุมที่คุณไม่ได้ใช้ที่อื่น</p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="input-group">
              <label>รหัสผ่านปัจจุบัน</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label>รหัสผ่านใหม่</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label>ยืนยันรหัสผ่านใหม่</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="btn-primary">อัปเดตรหัสผ่าน</button>
          </div>
        </div>

        <div className="security-card">
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-shield-check"></i></div>
            <div className="title-box">
              <h3>การยืนยันตัวตนสองชั้น (2FA)</h3>
              <p>เพิ่มชั้นความปลอดภัยอีกระดับให้กับบัญชีของคุณ</p>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="2fa-toggle" 
                checked={twoFA} 
                onChange={() => setTwoFA(!twoFA)} 
              />
              <label htmlFor="2fa-toggle"></label>
            </div>
          </div>
          
          <div className="card-content">
            <div className={`status-banner ${twoFA ? 'active' : 'inactive'}`}>
              <i className={twoFA ? "fi fi-rr-check-circle" : "fi fi-rr-info"}></i>
              <span>{twoFA ? 'เปิดใช้งาน 2FA แล้ว' : 'ยังไม่ได้เปิดใช้งาน 2FA'}</span>
            </div>
            <p className="description">
              เมื่อเปิดใช้งาน คุณจะต้องป้อนรหัสความปลอดภัยจากแอปยืนยันตัวตนของคุณนอกเหนือจากรหัสผ่านเพื่อเข้าสู่ระบบ
            </p>
            {twoFA && (
              <button className="btn-outline">กำหนดค่าแอปยืนยันตัวตน</button>
            )}
          </div>
        </div>

        <div className="security-card full-width">
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-laptop"></i></div>
            <div className="title-box">
              <h3>เซสชันที่ใช้งานอยู่</h3>
              <p>รายการอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณในขณะนี้</p>
            </div>
          </div>
          
          <div className="session-list">
            <div className="session-item">
              <div className="device-icon"><i className="fi fi-rr-computer"></i></div>
              <div className="session-info">
                <div className="device">Windows PC • Chrome</div>
                <div className="location">กรุงเทพฯ, ประเทศไทย • <span className="current-badge">เซสชันปัจจุบัน</span></div>
              </div>
              <div className="session-time">ใช้งานเมื่อครู่</div>
            </div>
            <div className="session-item">
              <div className="device-icon"><i className="fi fi-rr-smartphone"></i></div>
              <div className="session-info">
                <div className="device">iPhone 13 • Safari</div>
                <div className="location">กรุงเทพฯ, ประเทศไทย</div>
              </div>
              <div className="session-time">2 ชั่วโมงที่แล้ว</div>
              <button className="btn-icon-only" title="Logout from device">
                <i className="fi fi-rr-sign-out-alt"></i>
              </button>
            </div>
          </div>
          
          <div className="card-footer">
            <button className="btn-danger-text">ออกจากระบบเซสชันอื่นๆ ทั้งหมด</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .security-view {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .security-header {
          margin-bottom: 40px;
        }

        .security-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0 0 8px 0;
        }

        .security-header p {
          color: var(--muted);
          font-size: 1.1rem;
        }

        .security-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .security-card {
          background: white;
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }

        .full-width {
          grid-column: span 2;
        }

        .card-header {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: flex-start;
        }

        .icon-box {
          width: 50px;
          height: 50px;
          background: #f8f9fa;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--primary);
        }

        .title-box h3 {
          margin: 0 0 5px 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .title-box p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.5;
        }

        .card-content {
          flex: 1;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          font-family: inherit;
          transition: 0.3s;
        }

        .input-group input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
          margin-top: 10px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 107, 0, 0.2);
        }

        .btn-outline {
          background: white;
          color: var(--text-dark);
          border: 2px solid #eee;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
        }

        .btn-outline:hover {
          background: #f8f9fa;
          border-color: #ddd;
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 14px;
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .status-banner.active {
          background: #ecfdf5;
          color: #059669;
        }

        .status-banner.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .description {
          font-size: 0.95rem;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 25px;
        }

        /* Toggle Switch */
        .toggle-switch {
          margin-left: auto;
        }

        .toggle-switch input {
          display: none;
        }

        .toggle-switch label {
          display: block;
          width: 50px;
          height: 28px;
          background: #ddd;
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: 0.3s;
        }

        .toggle-switch label::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: 0.3s;
        }

        .toggle-switch input:checked + label {
          background: var(--primary);
        }

        .toggle-switch input:checked + label::after {
          left: 25px;
        }

        /* Sessions */
        .session-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .session-item {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 18px;
          gap: 20px;
        }

        .device-icon {
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--muted);
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .session-info {
          flex: 1;
        }

        .device {
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 4px;
        }

        .location {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .current-badge {
          color: #10b981;
          font-weight: 700;
        }

        .session-time {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .btn-icon-only {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 1.1rem;
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          transition: 0.3s;
        }

        .btn-icon-only:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .card-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .btn-danger-text {
          background: none;
          border: none;
          color: #ef4444;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
        }

        @media (max-width: 900px) {
          .security-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
