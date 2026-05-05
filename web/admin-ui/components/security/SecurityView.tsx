"use client";

import { useState } from "react";

export default function SecurityView() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="security-view animate-in opacity-0">
      <div className="security-header mb-12">
        <h1 className="text-[42px] font-black text-[var(--text)] mb-3 tracking-tighter">ความปลอดภัย</h1>
        <p className="text-[18px] text-[var(--text)]0 font-medium">จัดการการตั้งค่าความปลอดภัยและการเข้าถึงบัญชีของคุณด้วยระบบมาตรฐานสากล</p>
      </div>

      <div className="security-grid grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass !rounded-[40px] p-10 animate-slide-left opacity-0 delay-150 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-[var(--border)]/60 bg-[var(--surface-1)]">
          <div className="card-header flex gap-6 mb-10 items-start">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-[28px] shadow-sm shrink-0 border border-orange-100/50">
              <i className="fi fi-rr-key"></i>
            </div>
            <div className="title-box">
              <h3 className="text-[24px] font-black text-[var(--text)] mb-2 tracking-tight">เปลี่ยนรหัสผ่าน</h3>
              <p className="text-[var(--text)]0 font-medium leading-relaxed">เราขอแนะนำให้คุณใช้รหัสผ่านที่รัดกุมและเปลี่ยนเป็นประจำเพื่อความปลอดภัยสูงสุด</p>
            </div>
          </div>
          
          <div className="card-content space-y-6">
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">รหัสผ่านปัจจุบัน</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">รหัสผ่านใหม่</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">ยืนยันรหัสผ่านใหม่</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <button className="btn-primary !w-full !py-4 !text-[16px] !rounded-2xl mt-4 shadow-xl">อัปเดตรหัสผ่านใหม่</button>
          </div>
        </div>

        <div className="glass !rounded-[40px] p-10 animate-slide-right opacity-0 delay-300 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-[var(--border)] bg-[var(--surface-1)] flex flex-col">
          <div className="card-header flex gap-6 mb-10 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-blue-500 flex items-center justify-center text-[28px] shadow-sm shrink-0 border border-blue-100/50">
              <i className="fi fi-rr-shield-check"></i>
            </div>
            <div className="title-box flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] font-black text-[var(--text)] mb-2 tracking-tight">ยืนยันตัวตนสองชั้น (2FA)</h3>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="2fa-toggle" 
                    checked={twoFA} 
                    onChange={() => setTwoFA(!twoFA)} 
                    className="hidden"
                  />
                  <label htmlFor="2fa-toggle" className={`block w-16 h-9 rounded-full relative cursor-pointer transition-all duration-500 ${twoFA ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}>
                    <div className={`absolute top-1 w-7 h-7 bg-[var(--surface-1)] rounded-full transition-all duration-500 shadow-md ${twoFA ? 'left-8' : 'left-1'}`}></div>
                  </label>
                </div>
              </div>
              <p className="text-[var(--text)]0 font-medium leading-relaxed">เพิ่มชั้นความปลอดภัยอีกระดับด้วยรหัสยืนยันตัวตนจากสมาร์ทโฟนของคุณ</p>
            </div>
          </div>
          
          <div className="card-content flex-1 flex flex-col">
            <div className={`status-banner p-6 rounded-[24px] mb-8 flex items-center gap-4 transition-all duration-500 ${twoFA ? 'bg-[var(--success-bg)] text-emerald-600 border border-emerald-100' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${twoFA ? 'bg-[var(--success-bg)]0 text-[var(--primary-contrast)]' : 'bg-[var(--border)] text-[var(--text)]0'}`}>
                <i className={twoFA ? "fi fi-rr-check" : "fi fi-rr-lock"}></i>
              </div>
              <span className="text-[17px] font-bold">{twoFA ? 'ระบบ 2FA เปิดใช้งานอยู่' : 'ระบบ 2FA ปิดอยู่ (ไม่แนะนำ)'}</span>
            </div>
            
            <p className="text-[var(--text)]0 font-medium leading-relaxed mb-10 text-[15px]">
              เมื่อเปิดใช้งาน คุณจะต้องป้อนรหัสความปลอดภัยจากแอปยืนยันตัวตน (เช่น Google Authenticator) ทุกครั้งที่เข้าสู่ระบบจากอุปกรณ์ใหม่
            </p>
            
            <div className="mt-auto">
              {twoFA ? (
                <button className="glass !bg-[var(--surface-1)] !text-[var(--text)] !border-[var(--border)] hover:!border-blue-400 hover:!text-blue-500 !py-4 !w-full !rounded-2xl font-bold transition-all">กำหนดค่าแอปยืนยันตัวตน</button>
              ) : (
                <button 
                  onClick={() => setTwoFA(true)}
                  className="btn-primary !bg-[var(--text)] !text-[var(--primary-contrast)] hover:!bg-[var(--text)] !py-4 !w-full !rounded-2xl shadow-lg"
                >
                  เริ่มต้นตั้งค่า 2FA
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass lg:col-span-2 !rounded-[40px] p-10 animate-in opacity-0 delay-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-[var(--border)] bg-[var(--surface-1)]">
          <div className="card-header border-b border-[var(--border)]/50 pb-8 mb-10">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-[var(--text)] flex items-center justify-center text-[28px] shadow-sm shrink-0">
                <i className="fi fi-rr-laptop"></i>
              </div>
              <div className="title-box">
                <h3 className="text-[24px] font-black text-[var(--text)] mb-1 tracking-tight">เซสชันที่ใช้งานอยู่</h3>
                <p className="text-[var(--text)]0 font-medium">รายการอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณในขณะนี้</p>
              </div>
            </div>
          </div>
          
          <div className="session-list space-y-6">
            {[
              { icon: "fi fi-rr-desktop", device: "Windows PC • Chrome", location: "กรุงเทพฯ, ประเทศไทย", current: true, time: "ใช้งานเมื่อครู่" },
              { icon: "fi fi-rr-smartphone", device: "iPhone 13 • Safari", location: "กรุงเทพฯ, ประเทศไทย", current: false, time: "2 ชั่วโมงที่แล้ว" }
            ].map((session, idx) => (
              <div key={idx} className="session-item glass !bg-[var(--surface-1)] !border-[var(--border)] p-6 rounded-[30px] flex items-center gap-6 group hover:!border-[var(--primary)]/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center text-2xl group-hover:bg-orange-50 group-hover:text-[var(--primary)] transition-all">
                  <i className={session.icon}></i>
                </div>
                <div className="session-info flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[18px] font-black text-[var(--text)]">{session.device}</span>
                    {session.current && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-200">Current Session</span>}
                  </div>
                  <div className="text-[14px] font-bold text-[var(--text-muted)] flex items-center gap-2">
                    <i className="fi fi-rr-marker text-[12px]"></i> {session.location} • {session.time}
                  </div>
                </div>
                {!session.current && (
                  <button className="w-12 h-12 rounded-xl text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-all" title="Logout from device">
                    <i className="fi fi-rr-exit text-xl"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="card-footer mt-10 pt-8 border-top border-[var(--border)]/50 flex justify-center">
            <button className="text-[15px] font-black text-red-500 hover:text-red-600 hover:underline px-8 py-3 rounded-full hover:bg-red-50 transition-all">ออกจากระบบเซสชันอื่นๆ ทั้งหมด</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .security-view {
          padding: 40px;
          max-width: 1300px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

