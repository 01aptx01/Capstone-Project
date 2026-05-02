"use client";

import { useState } from "react";

export default function SettingsView() {
  const [notifications, setNotifications] = useState({
    sales: true,
    inventory: true,
    system: true,
    marketing: false
  });

  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactMode: false,
    language: "th"
  });

  return (
    <div className="settings-view animate-in">
      <div className="settings-header">
        <h1 className="gradient-text">ตั้งค่า</h1>
        <p>ปรับแต่งการใช้งานและจัดการการแจ้งเตือนของระบบ</p>
      </div>

      <div className="settings-sections">
        <div className="settings-card vibrant-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-palette"></i></div>
            <div className="title-box">
              <h3>การแสดงผล</h3>
              <p>ปรับแต่งหน้าตาของระบบตามที่คุณต้องการ</p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-info">
                <label>โหมดมืด (Dark Mode)</label>
                <span>ปรับเปลี่ยนโทนสีของระบบให้เป็นสีเข้ม</span>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="dark-mode" 
                  checked={appearance.darkMode} 
                  onChange={() => setAppearance({...appearance, darkMode: !appearance.darkMode})} 
                />
                <label htmlFor="dark-mode"></label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>โหมดกะทัดรัด (Compact Mode)</label>
                <span>ลดระยะห่างระหว่างองค์ประกอบต่างๆ</span>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="compact-mode" 
                  checked={appearance.compactMode} 
                  onChange={() => setAppearance({...appearance, compactMode: !appearance.compactMode})} 
                />
                <label htmlFor="compact-mode"></label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>ภาษา (Language)</label>
                <span>เลือกภาษาที่ต้องการใช้งานในระบบ</span>
              </div>
              <div className="select-wrapper">
                <select 
                  className="select-input" 
                  value={appearance.language} 
                  onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                >
                  <option value="th">ไทย (Thai)</option>
                  <option value="en">English (US)</option>
                </select>
                <i className="fi fi-rr-angle-small-down"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card vibrant-card animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-bell"></i></div>
            <div className="title-box">
              <h3>การแจ้งเตือน</h3>
              <p>เลือกรับการแจ้งเตือนที่สำคัญสำหรับคุณ</p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="setting-item">
              <div className="setting-info">
                <label>ยอดขายรายวัน</label>
                <span>รับสรุปยอดขายของทุกตู้ในแต่ละวัน</span>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="notif-sales" 
                  checked={notifications.sales} 
                  onChange={() => setNotifications({...notifications, sales: !notifications.sales})} 
                />
                <label htmlFor="notif-sales"></label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>สินค้าใกล้หมด</label>
                <span>แจ้งเตือนเมื่อสินค้าในตู้มีจำนวนน้อยกว่าที่กำหนด</span>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="notif-inventory" 
                  checked={notifications.inventory} 
                  onChange={() => setNotifications({...notifications, inventory: !notifications.inventory})} 
                />
                <label htmlFor="notif-inventory"></label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>สถานะระบบและข้อผิดพลาด</label>
                <span>แจ้งเตือนเมื่อระบบขัดข้องหรือเครื่องมีปัญหา</span>
              </div>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="notif-system" 
                  checked={notifications.system} 
                  onChange={() => setNotifications({...notifications, system: !notifications.system})} 
                />
                <label htmlFor="notif-system"></label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card vibrant-card full-width animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div className="icon-box"><i className="fi fi-rr-time-forward"></i></div>
            <div className="title-box">
              <h3>ภูมิภาคและเวลา</h3>
              <p>ตั้งค่ารูปแบบวันที่และเขตเวลา</p>
            </div>
          </div>
          
          <div className="card-content grid-2-cols">
            <div className="setting-item vertical">
              <label>เขตเวลา (Timezone)</label>
              <div className="select-wrapper full-width">
                <select className="select-input full-width">
                  <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
                <i className="fi fi-rr-angle-small-down"></i>
              </div>
            </div>
            <div className="setting-item vertical">
              <label>รูปแบบวันที่ (Date Format)</label>
              <div className="select-wrapper full-width">
                <select className="select-input full-width">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
                <i className="fi fi-rr-angle-small-down"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer animate-in" style={{ animationDelay: '0.4s' }}>
        <button className="btn-secondary">
          <i className="fi fi-rr-refresh"></i> คืนค่าเริ่มต้น
        </button>
        <button className="btn-primary">
          <i className="fi fi-rr-disk"></i> บันทึกการตั้งค่า
        </button>
      </div>

      <style jsx>{`
        .settings-view {
          padding: 40px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 40px;
        }

        .settings-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #FF6B00 0%, #FF9E00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .settings-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .settings-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .settings-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .full-width {
          grid-column: span 2;
        }

        .card-header {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          align-items: center;
        }

        .icon-box {
          width: 54px;
          height: 54px;
          background: rgba(255, 107, 0, 0.1);
          border: 1px solid rgba(255, 107, 0, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #FF6B00;
          backdrop-filter: blur(10px);
        }

        .title-box h3 {
          margin: 0 0 4px 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
        }

        .title-box p {
          margin: 0;
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.5;
        }

        .card-content {
          flex: 1;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-item.vertical {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          border-bottom: none;
        }

        .setting-info label {
          display: block;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          font-size: 1rem;
        }

        .setting-info span {
          font-size: 0.9rem;
          color: #64748b;
        }

        .setting-item.vertical label {
          font-weight: 700;
          color: #1e293b;
          font-size: 1rem;
        }

        .select-wrapper {
          position: relative;
          min-width: 140px;
        }

        .select-wrapper.full-width {
          width: 100%;
        }

        .select-wrapper i {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          font-size: 1.2rem;
        }

        .select-input {
          width: 100%;
          padding: 12px 36px 12px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-family: inherit;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: 0.3s;
          appearance: none;
          cursor: pointer;
        }

        .select-input:focus {
          border-color: #FF6B00;
          background: rgba(255, 107, 0, 0.05);
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
        }

        .grid-2-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        /* Toggle Switch */
        .toggle-switch input {
          display: none;
        }

        .toggle-switch label {
          display: block;
          width: 52px;
          height: 28px;
          background: #e2e8f0;
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #cbd5e1;
        }

        .toggle-switch label::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .toggle-switch input:checked + label {
          background: linear-gradient(135deg, #FF6B00 0%, #FF9E00 100%);
          border-color: rgba(255, 107, 0, 0.3);
        }

        .toggle-switch input:checked + label::after {
          left: 26px;
        }

        .settings-footer {
          margin-top: 48px;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF6B00 0%, #FF9E00 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 25px rgba(255, 107, 0, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(255, 107, 0, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .settings-sections {
            grid-template-columns: 1fr;
          }
          .grid-2-cols {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .full-width {
            grid-column: span 1;
          }
          .settings-view {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

