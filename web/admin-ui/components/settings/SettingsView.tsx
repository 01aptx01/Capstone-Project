'use client';

import React, { useState } from 'react';

const SettingsView = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [is2FA, setIs2FA] = useState(true);

  return (
    <div className="py-4 px-2 max-w-[1200px] mx-auto animate-in">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your personal preferences and account security</p>
        </div>
        <button className="bg-[#FF6A00] text-white px-8 py-3 rounded-2xl font-bold shadow-[0_12px_24px_rgba(255,106,0,0.2)] hover:scale-105 transition-transform active:scale-95">
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - General Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#EAF2F6]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6A00]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">General Settings</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
              {/* Profile Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-1 right-1 w-10 h-10 bg-[#FF6A00] rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </button>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">Avatar</p>
                  <p className="text-xs text-slate-400 font-medium">PNG or JPG, max 2MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Display Name</label>
                    <input 
                      type="text" 
                      defaultValue="Admin User"
                      className="w-full bg-[#F7F9FB] border-none rounded-2xl px-5 py-3.5 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Role</label>
                    <div className="relative">
                      <select className="w-full bg-[#F7F9FB] border-none rounded-2xl px-5 py-3.5 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none appearance-none cursor-pointer">
                        <option>Super Administrator</option>
                        <option>Manager</option>
                        <option>Editor</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="admin@modpao.com"
                    className="w-full bg-[#F7F9FB] border-none rounded-2xl px-5 py-3.5 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Editorial Bio</label>
                  <textarea 
                    rows={4}
                    defaultValue="Managing director for MOD PAO Vending solutions. Focused on hardware optimization and seamless customer experiences across 500+ locations."
                    className="w-full bg-[#F7F9FB] border-none rounded-3xl px-6 py-4 font-semibold text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Security & Appearance */}
        <div className="space-y-8">
          {/* Security Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#EAF2F6]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6A00]">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Security</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-1">
                <div>
                  <p className="font-bold text-slate-800">Two-Factor Auth</p>
                  <p className="text-xs text-slate-400 font-medium">Secure your account</p>
                </div>
                <button 
                  onClick={() => setIs2FA(!is2FA)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${is2FA ? 'bg-[#FF6A00]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${is2FA ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-1">
                <div>
                  <p className="font-bold text-slate-800">Dark Mode</p>
                  <p className="text-xs text-slate-400 font-medium">Reduced eye strain</p>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${isDarkMode ? 'bg-[#FF6A00]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4">
                <button className="w-full py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all">
                  Reset Password
                </button>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Sessions</p>
                <div className="space-y-4">
                  {[
                    { device: 'MacBook Pro 16"', location: 'Bangkok, TH', icon: '💻' },
                    { device: 'iPhone 15 Pro', location: 'Bangkok, TH', icon: '📱' }
                  ].map((session, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">{session.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{session.device}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{session.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Notification Preferences */}
      <div className="mt-8 bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#EAF2F6]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6A00]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Notification Preferences</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center px-8">Email</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center px-8">Push Notification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { title: 'Editorial Updates', desc: 'News about our services and product improvements' },
                { title: 'Product Feedback', desc: 'When customers leave feedback on vending items' },
                { title: 'System Status', desc: 'Critical alerts regarding machine health and stock' },
                { title: 'New Sales Report', desc: 'Daily summary of revenue and top products' }
              ].map((item, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </td>
                  <td className="py-6 text-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={i % 2 === 0}
                      className="w-5 h-5 rounded-md border-slate-200 text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer"
                    />
                  </td>
                  <td className="py-6 text-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={i < 2}
                      className="w-5 h-5 rounded-md border-slate-200 text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
