"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Mod Pao Admin",
    email: "admin@modpao.vending",
    phone: "081-234-5678",
    role: "System Administrator",
    bio: "Managing the next generation of smart vending machines with focus on reliability and user experience.",
    location: "Bangkok, Thailand",
    joined: "May 2024"
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-container animate-in">
      {/* Upper Section: Cover & Identity */}
      <div className="profile-hero">
        <div className="hero-bg">
          <div className="mesh-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="avatar-section">
            <div className="avatar-container">
              <Image src="/Pao.png" alt="Admin" width={140} height={140} className="avatar-img" />
              <div className="status-indicator online"></div>
              <button className="edit-avatar-btn">
                <i className="fi fi-rr-camera"></i>
              </button>
            </div>
            <div className="identity-text">
              <div className="name-row">
                <h1>{formData.name}</h1>
                <span className="verified-badge" title="Verified Staff">
                  <i className="fi fi-rr-badge-check"></i>
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-item"><i className="fi fi-rr-briefcase"></i> {formData.role}</span>
                <span className="meta-item"><i className="fi fi-rr-marker"></i> {formData.location}</span>
                <span className="meta-item"><i className="fi fi-rr-calendar"></i> เข้าร่วมเมื่อ {formData.joined}</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <i className="fi fi-rr-settings-sliders"></i>
                จัดการโปรไฟล์
              </button>
            ) : (
              <div className="edit-buttons">
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>ยกเลิก</button>
                <button className="btn-save" onClick={handleSave}>บันทึกข้อมูล</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left: Detailed Info */}
        <div className="grid-left">
          <div className="glass-card info-card">
            <div className="card-header">
              <h3><i className="fi fi-rr-info"></i> ข้อมูลบัญชี</h3>
            </div>
            <div className="info-form">
              <div className="form-row">
                <div className="form-group">
                  <label>ชื่อ-นามสกุล</label>
                  {isEditing ? (
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  ) : (
                    <div className="static-value">{formData.name}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <div className="static-value">{formData.role}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>อีเมล</label>
                  {isEditing ? (
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  ) : (
                    <div className="static-value">{formData.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>เบอร์โทรศัพท์</label>
                  {isEditing ? (
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  ) : (
                    <div className="static-value">{formData.phone}</div>
                  )}
                </div>
              </div>

              <div className="form-group full">
                <label>เกี่ยวกับฉัน</label>
                {isEditing ? (
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                ) : (
                  <p className="bio-text">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card activity-card">
            <div className="card-header">
              <h3><i className="fi fi-rr-time-past"></i> กิจกรรมล่าสุด</h3>
              <button className="btn-text">ดูทั้งหมด</button>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-icon bg-orange"><i className="fi fi-rr-box"></i></div>
                <div className="timeline-info">
                  <p>เติมสินค้าในตู้ <strong>Vending Central Ladprao</strong></p>
                  <span>10 นาทีที่แล้ว</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon bg-blue"><i className="fi fi-rr-refresh"></i></div>
                <div className="timeline-info">
                  <p>อัปเดตเฟิร์มแวร์ตู้ <strong>#M-045</strong></p>
                  <span>3 ชั่วโมงที่แล้ว</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon bg-green"><i className="fi fi-rr-coins"></i></div>
                <div className="timeline-info">
                  <p>ตรวจสอบยอดเงินสดประจำวัน</p>
                  <span>เมื่อวานนี้, 18:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats & Badges */}
        <div className="grid-right">
          <div className="glass-card completion-card">
            <div className="progress-header">
              <span className="label">ความสมบูรณ์ของโปรไฟล์</span>
              <span className="value">85%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '85%' }}></div>
            </div>
            <p>เพิ่มรูปหน้าปกเพื่อเพิ่มความสมบูรณ์เป็น 100%</p>
          </div>

          <div className="glass-card stats-card">
            <div className="stat-row">
              <div className="stat-box">
                <span className="stat-val">12</span>
                <span className="stat-lbl">ตู้ที่ดูแล</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">4.8</span>
                <span className="stat-lbl">เรตติ้ง</span>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <span className="stat-val">1.2k</span>
                <span className="stat-lbl">ยอดขายรวม</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">100%</span>
                <span className="stat-lbl">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Hero Section */
        .profile-hero {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          background: white;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .hero-bg {
          height: 180px;
          position: relative;
          background: linear-gradient(135deg, var(--sidebar-accent), #FF8C38);
        }

        .mesh-gradient {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(at 0% 0%, hsla(28,100%,74%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(10,100%,64%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(42,100%,70%,1) 0, transparent 50%);
          opacity: 0.6;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          padding: 0 40px 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: -50px;
          position: relative;
          z-index: 5;
        }

        .avatar-section {
          display: flex;
          align-items: flex-end;
          gap: 25px;
        }

        .avatar-container {
          position: relative;
          padding: 5px;
          background: white;
          border-radius: 42px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .avatar-img {
          border-radius: 38px;
          display: block;
          object-fit: cover;
          background: #f8f9fa;
        }

        .status-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 4px solid white;
        }

        .status-indicator.online { background: #10b981; }

        .edit-avatar-btn {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          color: white;
          border: none;
          border-radius: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0;
          transition: 0.3s;
        }

        .avatar-container:hover .edit-avatar-btn {
          opacity: 1;
        }

        .identity-text h1 {
          font-size: 2.2rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .verified-badge {
          color: #3b82f6;
          font-size: 1.4rem;
          display: flex;
        }

        .meta-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 0.95rem;
          color: var(--muted);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta-item i {
          color: var(--primary);
        }

        .btn-edit {
          background: #0f172a;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 99px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .btn-edit:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(15, 23, 42, 0.25);
          background: #000;
        }

        /* Grid Layout */
        .profile-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 25px;
        }

        .glass-card {
          background: white;
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.03);
          margin-bottom: 25px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .card-header h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }

        /* Form Styling */
        .info-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .static-value {
          font-weight: 600;
          color: #0f172a;
          padding: 12px 0;
          font-size: 1.05rem;
        }

        .info-form input, .info-form textarea {
          width: 100%;
          padding: 14px 18px;
          background: #f8f9fa;
          border: 2px solid #f0f0f0;
          border-radius: 14px;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          transition: 0.3s;
        }

        .info-form input:focus {
          border-color: var(--primary);
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
        }

        .bio-text {
          font-size: 1.05rem;
          color: #0f172a;
          line-height: 1.6;
          font-weight: 500;
        }

        /* Timeline */
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .timeline-item {
          display: flex;
          gap: 18px;
          position: relative;
        }

        .timeline-item::after {
          content: '';
          position: absolute;
          left: 20px;
          top: 45px;
          bottom: -20px;
          width: 2px;
          background: #f0f0f0;
        }

        .timeline-item:last-child::after { display: none; }

        .timeline-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }

        .bg-orange { background: var(--primary); }
        .bg-blue { background: #3b82f6; }
        .bg-green { background: #10b981; }

        .timeline-info p {
          margin: 0 0 5px 0;
          font-weight: 600;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .timeline-info span {
          font-size: 0.8rem;
          color: var(--muted);
          font-weight: 600;
        }

        /* Right Side Cards */
        .completion-card {
          background: linear-gradient(135deg, var(--sidebar-accent), #FF8C38);
          color: white;
          box-shadow: 0 15px 30px rgba(255, 106, 0, 0.2);
          border: none;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .progress-bar {
          height: 10px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          margin-bottom: 15px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }

        .completion-card p {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.9);
          margin: 0;
          font-weight: 500;
        }

        .stats-card {
          padding: 10px;
          background: #f8f9fa;
        }

        .stat-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .stat-row:last-child { margin-bottom: 0; }

        .stat-box {
          flex: 1;
          background: white;
          padding: 25px 15px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.02);
        }

        .stat-val {
          display: block;
          font-size: 1.6rem;
          font-weight: 850;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .stat-lbl {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
        }

        .badge-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .badge-item {
          aspect-ratio: 1;
          background: #f8f9fa;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          transition: 0.3s;
          border: 2px solid transparent;
        }

        .badge-item:hover {
          transform: scale(1.1) rotate(5deg);
          border-color: var(--primary);
          background: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        /* Edit Controls */
        .edit-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          padding: 12px 24px;
          border-radius: 14px;
          border: 2px solid #eee;
          background: white;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-save {
          padding: 12px 24px;
          border-radius: 14px;
          border: none;
          background: var(--primary);
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
          .hero-content { flex-direction: column; align-items: center; text-align: center; }
          .avatar-section { flex-direction: column; align-items: center; }
          .hero-actions { margin-top: 20px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
