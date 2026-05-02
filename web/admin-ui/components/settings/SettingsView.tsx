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
        <h1>ตั้งค่า</h1>
        <p>ปรับแต่งการใช้งานและจัดการการแจ้งเตือนของระบบ</p>
      </div>

      <div className="settings-sections">
        <div className="settings-card">
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
              <select 
                className="select-input" 
                value={appearance.language} 
                onChange={(e) => setAppearance({...appearance, language: e.target.value})}
              >
                <option value="th">ไทย (Thai)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card">
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

        <div className="settings-card full-width">
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
              <select className="select-input full-width">
                <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                <option>(GMT+00:00) UTC</option>
              </select>
            </div>
            <div className="setting-item vertical">
              <label>รูปแบบวันที่ (Date Format)</label>
              <select className="select-input full-width">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn-secondary">คืนค่าเริ่มต้น</button>
        <button className="btn-primary">บันทึกการตั้งค่า</button>
      </div>

      <style jsx>{`
        .settings-view {
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 40px;
        }

        .settings-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0 0 8px 0;
        }

        .settings-header p {
          color: var(--muted);
          font-size: 1.1rem;
        }

        .settings-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .settings-card {
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

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-item.vertical {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          border-bottom: none;
        }

        .setting-info label {
          display: block;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 4px;
        }

        .setting-info span {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .select-input {
          padding: 10px 16px;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          font-family: inherit;
          font-weight: 600;
          color: var(--text-dark);
          outline: none;
          transition: 0.3s;
        }

        .select-input:focus {
          border-color: var(--primary);
        }

        .select-input.full-width {
          width: 100%;
        }

        .grid-2-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Toggle Switch */
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

        .settings-footer {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
          gap: 15px;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 107, 0, 0.2);
        }

        .btn-secondary {
          background: #f5f5f5;
          color: var(--text-dark);
          border: none;
          padding: 14px 30px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        @media (max-width: 800px) {
          .settings-sections {
            grid-template-columns: 1fr;
          }
          .grid-2-cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
