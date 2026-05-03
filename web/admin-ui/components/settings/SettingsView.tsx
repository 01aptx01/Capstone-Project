"use client";

import { useState } from "react";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("general");

  // General States
  const [notifications, setNotifications] = useState({
    sales: true,
    inventory: true,
    system: true,
  });
  const [appearance, setAppearance] = useState({
    darkMode: false,
    language: "th"
  });

  // Security States
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [phoneState, setPhoneState] = useState({ current: "081-234-5678", new: "", otp: "", step: "input" });

  // Admin Permissions States
  const [isFirstAdmin, setIsFirstAdmin] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: "", tempPassword: "" });
  const [authorizedAdmins, setAuthorizedAdmins] = useState([
    { id: 1, email: "manager@example.com", status: "Active" },
    { id: 2, email: "newhire@example.com", status: "Pending" }
  ]);

  const handlePhoneSubmit = () => {
    if (phoneState.step === "input" && phoneState.new) {
      setPhoneState(s => ({ ...s, step: "otp" }));
    } else if (phoneState.step === "otp" && phoneState.otp.length >= 4) {
      setPhoneState(s => ({ ...s, step: "success", current: s.new, new: "", otp: "" }));
      setTimeout(() => setPhoneState(s => ({ ...s, step: "input" })), 3000);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email) return;
    setAuthorizedAdmins(s => [...s, { id: Date.now(), email: inviteForm.email, status: "Pending" }]);
    setInviteForm({ email: "", tempPassword: "" });
  };

  const handleRevoke = (id: number) => {
    setAuthorizedAdmins(s => s.filter(a => a.id !== id));
  };

  return (
    <div className="settings-view animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-[32px] font-black text-[#1e293b] mb-2 tracking-tight">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-[#64748B] text-[15px] font-medium">ปรับแต่งการใช้งาน ความปลอดภัย และจัดการสิทธิ์ผู้ดูแลระบบ</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#E2E8F0]">
        <button 
          onClick={() => setActiveTab("general")}
          className={`px-6 py-4 font-bold text-[15px] border-b-2 transition-all ${activeTab === 'general' ? 'border-[#f47b2a] text-[#f47b2a]' : 'border-transparent text-[#64748B] hover:text-[#334155]'}`}
        >
          General Settings
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`px-6 py-4 font-bold text-[15px] border-b-2 transition-all ${activeTab === 'security' ? 'border-[#f47b2a] text-[#f47b2a]' : 'border-transparent text-[#64748B] hover:text-[#334155]'}`}
        >
          Security Settings
        </button>
        <button 
          onClick={() => setActiveTab("admin")}
          className={`px-6 py-4 font-bold text-[15px] border-b-2 transition-all ${activeTab === 'admin' ? 'border-[#f47b2a] text-[#f47b2a]' : 'border-transparent text-[#64748B] hover:text-[#334155]'}`}
        >
          Admin Permissions
        </button>
      </div>

      {/* GENERAL TAB */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-[18px] font-black text-[#1e293b] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f47b2a] flex items-center justify-center text-xl"><i className="fi fi-rr-palette"></i></div>
              การแสดงผล (Display)
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
                <div>
                  <div className="font-bold text-[#1e293b] text-[15px]">โหมดมืด (Dark Mode)</div>
                  <div className="text-[#64748B] text-[13px] mt-1">ปรับเปลี่ยนโทนสีของระบบให้เป็นสีเข้ม</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={appearance.darkMode} onChange={() => setAppearance(s => ({...s, darkMode: !s.darkMode}))} />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#f47b2a]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1e293b] text-[15px]">ภาษา (Language)</div>
                  <div className="text-[#64748B] text-[13px] mt-1">เลือกภาษาที่ต้องการใช้งานในระบบ</div>
                </div>
                <select 
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl font-bold text-[#334155] outline-none focus:border-[#f47b2a]"
                  value={appearance.language} 
                  onChange={(e) => setAppearance(s => ({...s, language: e.target.value}))}
                >
                  <option value="th">ไทย (Thai)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-[18px] font-black text-[#1e293b] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f47b2a] flex items-center justify-center text-xl"><i className="fi fi-rr-bell"></i></div>
              การแจ้งเตือน (Notifications)
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
                <div>
                  <div className="font-bold text-[#1e293b] text-[15px]">สินค้าใกล้หมด (Low Stock Alerts)</div>
                  <div className="text-[#64748B] text-[13px] mt-1">แจ้งเตือนเมื่อสินค้าในตู้มีจำนวนน้อยกว่าที่กำหนด</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.inventory} onChange={() => setNotifications(s => ({...s, inventory: !s.inventory}))} />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#f47b2a]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1e293b] text-[15px]">สถานะระบบ (System Errors)</div>
                  <div className="text-[#64748B] text-[13px] mt-1">แจ้งเตือนเมื่อระบบขัดข้องหรือเครื่องมีปัญหา</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.system} onChange={() => setNotifications(s => ({...s, system: !s.system}))} />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#f47b2a]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-max">
            <h3 className="text-[18px] font-black text-[#1e293b] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f47b2a] flex items-center justify-center text-xl"><i className="fi fi-rr-lock"></i></div>
              จัดการรหัสผ่าน (Password Management)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-2">รหัสผ่านปัจจุบัน</label>
                <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(s => ({...s, current: e.target.value}))} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-2">รหัสผ่านใหม่</label>
                <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm(s => ({...s, new: e.target.value}))} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-2">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(s => ({...s, confirm: e.target.value}))} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all" />
              </div>
              <button className="w-full py-3.5 bg-[#f47b2a] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all mt-4">
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-max">
            <h3 className="text-[18px] font-black text-[#1e293b] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f47b2a] flex items-center justify-center text-xl"><i className="fi fi-rr-smartphone"></i></div>
              อัปเดตเบอร์โทรศัพท์ (Phone Number)
            </h3>
            
            {phoneState.step === "success" ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95">
                <i className="fi fi-rr-check-circle text-4xl"></i>
                <div className="font-bold">อัปเดตเบอร์โทรศัพท์สำเร็จ</div>
                <div className="text-[14px]">เบอร์ใหม่: {phoneState.current}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div className="text-[12px] font-bold text-slate-500">เบอร์โทรศัพท์ปัจจุบัน</div>
                  <div className="font-black text-slate-800 text-[16px]">{phoneState.current}</div>
                </div>

                {phoneState.step === "input" && (
                  <div className="animate-in slide-in-from-right-4">
                    <label className="block text-[13px] font-bold text-[#64748B] mb-2">เบอร์โทรศัพท์ใหม่</label>
                    <input 
                      type="text" 
                      placeholder="08X-XXX-XXXX"
                      value={phoneState.new} 
                      onChange={(e) => setPhoneState(s => ({...s, new: e.target.value}))} 
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all mb-4" 
                    />
                    <button onClick={handlePhoneSubmit} className="w-full py-3.5 bg-[#334155] text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                      ส่งรหัส OTP
                    </button>
                  </div>
                )}

                {phoneState.step === "otp" && (
                  <div className="animate-in slide-in-from-right-4">
                    <div className="text-[13px] text-slate-600 mb-4 font-medium">กรุณากรอกรหัส OTP ที่ส่งไปยังเบอร์ <span className="font-bold text-[#f47b2a]">{phoneState.new}</span></div>
                    <label className="block text-[13px] font-bold text-[#64748B] mb-2">รหัส OTP 6 หลัก</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={phoneState.otp} 
                      onChange={(e) => setPhoneState(s => ({...s, otp: e.target.value}))} 
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all text-center tracking-[0.5em] font-black text-xl mb-4" 
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setPhoneState(s => ({...s, step: "input"}))} className="px-6 py-3.5 bg-white border border-[#E2E8F0] text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all">
                        ยกเลิก
                      </button>
                      <button onClick={handlePhoneSubmit} className="flex-1 py-3.5 bg-[#f47b2a] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all">
                        ยืนยัน OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN PERMISSIONS TAB */}
      {activeTab === "admin" && (
        <div className="animate-in slide-in-from-left-4 duration-300">
          {!isFirstAdmin ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-2xl flex flex-col items-center justify-center gap-3">
              <i className="fi fi-rr-lock text-4xl"></i>
              <h3 className="font-black text-xl">การเข้าถึงถูกปฏิเสธ (Access Denied)</h3>
              <p className="font-medium text-[15px]">เฉพาะ First Admin เท่านั้นที่สามารถจัดการสิทธิ์ผู้ดูแลระบบได้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[18px] font-black text-[#1e293b] mb-2">เชิญผู้ดูแลระบบใหม่</h3>
                  <p className="text-[#64748B] text-[13px] mb-6">ผู้ที่ได้รับเชิญจะสามารถเข้าสู่ระบบและสร้างบัญชีได้</p>
                  
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="admin@example.com"
                        value={inviteForm.email} 
                        onChange={(e) => setInviteForm(s => ({...s, email: e.target.value}))} 
                        className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#64748B] mb-2">รหัสผ่านชั่วคราว (Temp Password)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="ตั้งรหัสผ่านชั่วคราว"
                        value={inviteForm.tempPassword} 
                        onChange={(e) => setInviteForm(s => ({...s, tempPassword: e.target.value}))} 
                        className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:border-[#f47b2a] outline-none transition-all" 
                      />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-[#f47b2a] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all mt-2">
                      ส่งคำเชิญ
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[18px] font-black text-[#1e293b] mb-6">รายชื่อผู้ที่ได้รับอนุญาต (Authorized Admin List)</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                          <th className="px-6 py-4 text-[12px] font-black text-[#64748B] uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-[12px] font-black text-[#64748B] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[12px] font-black text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {authorizedAdmins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#334155]">{admin.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              {admin.status === "Active" ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[12px] font-bold">Active</span>
                              ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[12px] font-bold">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleRevoke(admin.id)}
                                className="px-4 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg text-[13px] font-bold transition-all"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                        {authorizedAdmins.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400 font-bold">
                              ยังไม่มีผู้ดูแลระบบที่ได้รับเชิญ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .settings-view {
          padding: 24px 0;
          max-width: 1200px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #FF6B00 0%, #FF9E00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
