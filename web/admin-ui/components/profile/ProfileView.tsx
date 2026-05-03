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
    <div className="profile-container animate-in opacity-0">
      {/* Upper Section: Cover & Identity */}
      <div className="profile-hero animate-scale-in">
        <div className="hero-bg">
          <div className="mesh-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="avatar-section animate-float">
            <div className="avatar-container glass !p-1.5 !rounded-[42px] border-white/50">
              <div className="relative overflow-hidden rounded-[38px] bg-slate-100">
                <Image src="/Pao.png" alt="Admin" width={140} height={140} className="avatar-img transition-transform duration-700 hover:scale-110" />
              </div>
              <div className="status-indicator online animate-pulse"></div>
              <button className="edit-avatar-btn">
                <i className="fi fi-rr-camera"></i>
              </button>
            </div>
            <div className="identity-text">
              <div className="name-row">
                <h1 className="text-slate-800 drop-shadow-sm">{formData.name}</h1>
                <span className="verified-badge bg-slate-200/50 backdrop-blur-md p-1.5 rounded-full border border-slate-300 text-[#f47b2a]" title="Verified Staff">
                  <i className="fi fi-rr-badge-check"></i>
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-item text-slate-600"><i className="fi fi-rr-briefcase !text-slate-400"></i> {formData.role}</span>
                <span className="meta-item text-slate-600"><i className="fi fi-rr-marker !text-slate-400"></i> {formData.location}</span>
                <span className="meta-item text-slate-600"><i className="fi fi-rr-calendar !text-slate-400"></i> เข้าร่วมเมื่อ {formData.joined}</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            {!isEditing ? (
              <button className="btn-edit !bg-white !text-slate-700 hover:!bg-[#f47b2a] hover:!text-white transition-all duration-300 shadow-xl" onClick={() => setIsEditing(true)}>
                <i className="fi fi-rr-settings-sliders"></i>
                จัดการโปรไฟล์
              </button>
            ) : (
              <div className="edit-buttons">
                <button className="btn-cancel glass !bg-slate-100 !text-slate-700 !border-slate-200 hover:!bg-slate-200" onClick={() => setIsEditing(false)}>ยกเลิก</button>
                <button className="btn-save !bg-[#f47b2a] !text-white hover:!bg-[#EA580C]" onClick={handleSave}>บันทึกข้อมูล</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left: Detailed Info */}
        <div className="grid-left animate-slide-left opacity-0 delay-150">
          <div className="glass info-card !rounded-[40px] p-10 mb-8 shadow-2xl border-white/40 bg-white">
            <div className="card-header border-b border-slate-200/50 pb-6 mb-8">
              <h3 className="text-[24px] font-black tracking-tight flex items-center gap-3">
                <i className="fi fi-rr-info text-[#f47b2a] text-[28px]"></i> ข้อมูลบัญชี
              </h3>
            </div>
            <div className="info-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ชื่อ-นามสกุล</label>
                  {isEditing ? (
                    <input type="text" className="glass !bg-white !border-slate-200 focus:!border-[#f47b2a] !rounded-2xl !py-4 px-4 w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  ) : (
                    <div className="static-value text-[18px] font-bold text-slate-700">{formData.name}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ตำแหน่ง</label>
                  <div className="static-value text-[18px] font-bold text-slate-700">{formData.role}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 block">อีเมล</label>
                  {isEditing ? (
                    <input type="email" className="glass !bg-white !border-slate-200 focus:!border-[#f47b2a] !rounded-2xl !py-4 px-4 w-full" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  ) : (
                    <div className="static-value text-[18px] font-bold text-slate-700">{formData.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 block">เบอร์โทรศัพท์</label>
                  {isEditing ? (
                    <input type="text" className="glass !bg-white !border-slate-200 focus:!border-[#f47b2a] !rounded-2xl !py-4 px-4 w-full" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  ) : (
                    <div className="static-value text-[18px] font-bold text-slate-700">{formData.phone}</div>
                  )}
                </div>
              </div>

              <div className="form-group full mt-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 block">เกี่ยวกับฉัน</label>
                {isEditing ? (
                  <textarea rows={4} className="glass !bg-white !border-slate-200 focus:!border-[#f47b2a] !rounded-2xl !p-4 w-full" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                ) : (
                  <p className="bio-text text-[16px] text-slate-600 leading-relaxed font-medium">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass activity-card !rounded-[40px] p-10 shadow-2xl border-white/40 bg-white">
            <div className="card-header border-b border-slate-200/50 pb-6 mb-8 flex justify-between items-center">
              <h3 className="text-[24px] font-black tracking-tight flex items-center gap-3">
                <i className="fi fi-rr-time-past text-[#f47b2a] text-[28px]"></i> กิจกรรมล่าสุด
              </h3>
              <button className="text-[14px] font-bold text-[#f47b2a] hover:underline px-4 py-2 rounded-full hover:bg-[#f47b2a]/5 transition-all">ดูทั้งหมด</button>
            </div>
            <div className="timeline space-y-8">
              {[
                { icon: "fi fi-rr-box", color: "from-[#f47b2a] to-[#FB923C]", bg: "bg-orange-50", title: "เติมสินค้าในตู้", machine: "Vending Central Ladprao", time: "10 นาทีที่แล้ว" },
                { icon: "fi fi-rr-refresh", color: "from-[#3B82F6] to-[#60A5FA]", bg: "bg-blue-50", title: "อัปเดตเฟิร์มแวร์ตู้", machine: "#M-045", time: "3 ชั่วโมงที่แล้ว" },
                { icon: "fi fi-rr-coins", color: "from-[#10B981] to-[#34D399]", bg: "bg-emerald-50", title: "ตรวจสอบยอดเงินสดประจำวัน", machine: "", time: "เมื่อวานนี้, 18:30" }
              ].map((item, idx) => (
                <div key={idx} className="timeline-item flex gap-6 group">
                  <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <i className={item.icon}></i>
                  </div>
                  <div className="timeline-info py-1">
                    <p className="text-[17px] font-bold text-[#334155] mb-1">
                      {item.title} {item.machine && <strong className="text-[#f47b2a]">{item.machine}</strong>}
                    </p>
                    <span className="text-[14px] font-semibold text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats & Progress */}
        <div className="grid-right animate-slide-right opacity-0 delay-300">
          <div className="vibrant-card completion-card !rounded-[40px] !border-none !bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] text-slate-700 p-10 mb-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f47b2a] blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="progress-header flex justify-between items-end mb-4">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Completion</span>
                  <span className="text-[32px] font-black leading-none text-slate-800">85%</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-[#f47b2a] group-hover:text-[#f47b2a] transition-colors">
                  <i className="fi fi-rr-star"></i>
                </div>
              </div>
              <div className="progress-bar h-3 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div className="progress-fill h-full bg-gradient-to-r from-[#f47b2a] to-[#FB923C] shadow-[0_0_20px_rgba(244,123,42,0.3)] rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[14px] font-medium text-slate-500 leading-relaxed">เพิ่มรูปหน้าปกเพื่อเพิ่มความสมบูรณ์เป็น 100% และรับเหรียญตรา &quot;Admin Elite&quot;</p>
            </div>
          </div>

          <div className="glass stats-card !rounded-[40px] p-2 shadow-2xl border-white/40 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "12", lbl: "ตู้ที่ดูแล", icon: "fi fi-rr-box", color: "text-blue-500", bg: "bg-blue-50" },
                { val: "4.8", lbl: "เรตติ้ง", icon: "fi fi-rr-star", color: "text-amber-500", bg: "bg-amber-50" },
                { val: "1.2k", lbl: "ยอดขายรวม", icon: "fi fi-rr-bank", color: "text-[#f47b2a]", bg: "bg-orange-50" },
                { val: "100%", lbl: "Uptime", icon: "fi fi-rr-bolt", color: "text-emerald-500", bg: "bg-emerald-50" }
              ].map((stat, idx) => (
                <div key={idx} className="vibrant-card !rounded-[32px] !border-none !bg-white p-8 flex flex-col items-center justify-center group hover:!bg-slate-50 transition-all duration-500">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <i className={stat.icon}></i>
                  </div>
                  <span className="stat-val text-[28px] font-black text-slate-800">{stat.val}</span>
                  <span className="stat-lbl text-[12px] font-black text-slate-400 uppercase tracking-widest">{stat.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 30px;
        }

        .profile-hero {
          position: relative;
          border-radius: 48px;
          overflow: hidden;
          background: #F1F5F9;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          margin-bottom: 40px;
          height: 380px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #F8FAFC, #E2E8F0);
        }

        .mesh-gradient {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(at 0% 0%, rgba(244, 123, 42, 0.15) 0, transparent 50%), 
            radial-gradient(at 50% 0%, rgba(203, 213, 225, 0.4) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(244, 123, 42, 0.1) 0, transparent 50%);
          opacity: 0.8;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          padding: 0 50px 50px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          z-index: 5;
        }

        .avatar-section {
          display: flex;
          align-items: flex-end;
          gap: 35px;
        }

        .avatar-container {
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .avatar-container:hover {
          transform: translateY(-5px) scale(1.02);
        }

        .status-indicator {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 5px solid white;
          z-index: 10;
        }

        .status-indicator.online { background: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }

        .edit-avatar-btn {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          color: white;
          border: none;
          border-radius: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          cursor: pointer;
          opacity: 0;
          transition: 0.3s;
          z-index: 5;
        }

        .avatar-container:hover .edit-avatar-btn { opacity: 1; }

        .identity-text h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -2px;
          line-height: 1;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-edit {
          padding: 16px 32px;
          border-radius: 20px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 1.1rem;
        }

        /* Grid Layout */
        .profile-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 35px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .edit-buttons {
          display: flex;
          gap: 15px;
        }

        .btn-cancel, .btn-save {
          padding: 14px 28px;
          border-radius: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        @media (max-width: 1100px) {
          .profile-grid { grid-template-columns: 1fr; }
          .hero-content { flex-direction: column; align-items: center; text-align: center; height: auto; padding-top: 100px; }
          .avatar-section { flex-direction: column; align-items: center; gap: 20px; }
          .hero-actions { margin-top: 30px; }
          .profile-hero { height: auto; }
          .identity-text h1 { font-size: 2.5rem; }
          .meta-row { justify-content: center; }
        }
      `}</style>
    </div>
  );
}

