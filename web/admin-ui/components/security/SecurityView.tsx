"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useLang } from "@/lib/i18n/lang";
import { createAdmin, createInvite, type InviteResult } from "@/lib/auth";

type AddMode = "password" | "invite";

export default function SecurityView() {
  const { t } = useLang();
  const [twoFA, setTwoFA] = useState(false);

  // ── เพิ่มผู้ดูแลระบบใหม่ ──
  const [mode, setMode] = useState<AddMode>("password");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetResults = () => {
    setErrorMsg(null);
    setInviteResult(null);
    setCreatedAdmin(null);
    setCopied(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetResults();
    setLoading(true);
    try {
      const res = await createAdmin(email.trim().toLowerCase(), tempPassword, [role]);
      setCreatedAdmin({ email: res.email });
      setEmail("");
      setTempPassword("");
    } catch (err) {
      setErrorMsg(
        isAxiosError(err)
          ? String((err.response?.data as { error?: string })?.error || "สร้างบัญชีไม่สำเร็จ")
          : "สร้างบัญชีไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    resetResults();
    setLoading(true);
    try {
      const res = await createInvite(email.trim().toLowerCase(), [role]);
      setInviteResult(res);
      setEmail("");
    } catch (err) {
      setErrorMsg(
        isAxiosError(err)
          ? String((err.response?.data as { error?: string })?.error || "เชิญไม่สำเร็จ")
          : "เชิญไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!inviteResult?.invite_link) return;
    try {
      await navigator.clipboard.writeText(inviteResult.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="security-view animate-in opacity-0">
      <div className="security-header mb-12">
        <h1 className="text-[42px] font-black text-[var(--text)] mb-3 tracking-tighter">{t("security.title")}</h1>
        <p className="text-[18px] text-[var(--text-muted)] font-medium">{t("security.subtitle")}</p>
      </div>

      <div className="security-grid grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── เชิญผู้ดูแลระบบใหม่ (ทำงานจริง) ── */}
        <div className="glass lg:col-span-2 !rounded-[40px] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-[var(--border)]/60 bg-[var(--surface-1)]">
          <div className="card-header flex gap-6 mb-6 items-start">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-[28px] shadow-sm shrink-0 border border-orange-100/50">
              <i className="fi fi-rr-user-add"></i>
            </div>
            <div className="title-box">
              <h3 className="text-[24px] font-black text-[var(--text)] mb-2 tracking-tight">เพิ่มผู้ดูแลระบบใหม่</h3>
              <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                สร้างบัญชีพร้อมรหัสผ่านชั่วคราว หรือส่งลิงก์คำเชิญให้ตั้งรหัสเอง (เฉพาะ superadmin)
              </p>
            </div>
          </div>

          {/* สลับโหมด */}
          <div className="inline-flex bg-[var(--surface-2)] p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode("password"); resetResults(); }}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${
                mode === "password" ? "bg-[var(--surface-1)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              รหัสผ่านชั่วคราว
            </button>
            <button
              type="button"
              onClick={() => { setMode("invite"); resetResults(); }}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${
                mode === "invite" ? "bg-[var(--surface-1)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              ลิงก์คำเชิญ
            </button>
          </div>

          <form
            onSubmit={mode === "password" ? handleCreateAdmin : handleInvite}
            className="flex flex-col md:flex-row gap-4 items-stretch md:items-end flex-wrap"
          >
            <div className="flex-1 min-w-[220px]">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="newadmin@example.com"
                className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold"
              />
            </div>

            {mode === "password" && (
              <div className="flex-1 min-w-[200px]">
                <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">รหัสผ่านชั่วคราว</label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold"
                />
              </div>
            )}

            <div className="md:w-48">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">สิทธิ์ (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold cursor-pointer"
              >
                <option value="admin">admin</option>
                <option value="superadmin">superadmin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary !py-4 !px-8 !text-[15px] !rounded-2xl shadow-lg disabled:opacity-50 whitespace-nowrap"
            >
              {loading
                ? "กำลังทำงาน..."
                : mode === "password"
                  ? "สร้างบัญชี"
                  : "ส่งคำเชิญ"}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-5 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2">
              <i className="fi fi-rr-exclamation"></i>
              {errorMsg}
            </div>
          )}

          {/* ผลลัพธ์: สร้างบัญชีตรง */}
          {createdAdmin && (
            <div className="mt-5 bg-[var(--success-bg)] border border-emerald-100 rounded-2xl px-5 py-4 text-emerald-700 font-bold text-[14px] flex items-center gap-2">
              <i className="fi fi-rr-check-circle"></i>
              สร้างบัญชี <span className="font-black">{createdAdmin.email}</span> แล้ว — แจ้งอีเมลและรหัสผ่านชั่วคราวให้เขาเข้าสู่ระบบได้เลย (แนะนำให้เปลี่ยนรหัสภายหลัง)
            </div>
          )}

          {/* ผลลัพธ์: ลิงก์คำเชิญ */}
          {inviteResult && (
            <div className="mt-5 bg-[var(--success-bg)] border border-emerald-100 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-[14px] mb-2">
                <i className="fi fi-rr-check-circle"></i>
                สร้างคำเชิญสำหรับ {inviteResult.email} แล้ว
                {inviteResult.emailed ? " — ส่งอีเมลเรียบร้อย" : " (ยังไม่ได้ตั้ง SMTP — คัดลอกลิงก์ด้านล่างส่งให้เขาเอง)"}
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteResult.invite_link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[12px] font-mono text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-4 py-2.5 bg-[var(--text)] text-[var(--primary-contrast)] rounded-xl text-[13px] font-black whitespace-nowrap active:scale-95 transition-transform"
                >
                  {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass !rounded-[40px] p-10 animate-slide-left opacity-0 delay-150 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-[var(--border)]/60 bg-[var(--surface-1)]">
          <div className="card-header flex gap-6 mb-10 items-start">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-[28px] shadow-sm shrink-0 border border-orange-100/50">
              <i className="fi fi-rr-key"></i>
            </div>
            <div className="title-box">
              <h3 className="text-[24px] font-black text-[var(--text)] mb-2 tracking-tight">{t("security.changePassword")}</h3>
              <p className="text-[var(--text-muted)] font-medium leading-relaxed">{t("security.changePasswordDesc")}</p>
            </div>
          </div>
          
          <div className="card-content space-y-6">
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t("settings.password.current")}</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t("settings.password.new")}</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <div className="input-group">
              <label className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t("settings.password.confirm")}</label>
              <input type="password" placeholder="••••••••" className="glass !bg-[var(--surface-1)] !border-[var(--border)] focus:!border-[var(--primary)] !rounded-2xl !py-4 px-5 w-full font-bold tracking-widest" />
            </div>
            <button className="btn-primary !w-full !py-4 !text-[16px] !rounded-2xl mt-4 shadow-xl">{t("security.update")}</button>
          </div>
        </div>

        <div className="glass !rounded-[40px] p-10 animate-slide-right opacity-0 delay-300 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-[var(--border)] bg-[var(--surface-1)] flex flex-col">
          <div className="card-header flex gap-6 mb-10 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-blue-500 flex items-center justify-center text-[28px] shadow-sm shrink-0 border border-blue-100/50">
              <i className="fi fi-rr-shield-check"></i>
            </div>
            <div className="title-box flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-[24px] font-black text-[var(--text)] mb-2 tracking-tight">{t("security.twoFA")}</h3>
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
              <p className="text-[var(--text-muted)] font-medium leading-relaxed">{t("security.twoFADesc")}</p>
            </div>
          </div>
          
          <div className="card-content flex-1 flex flex-col">
            <div className={`status-banner p-6 rounded-[24px] mb-8 flex items-center gap-4 transition-all duration-500 ${twoFA ? 'bg-[var(--success-bg)] text-emerald-600 border border-emerald-100' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${twoFA ? 'bg-[var(--success-bg)]0 text-[var(--primary-contrast)]' : 'bg-[var(--border)] text-[var(--text)]0'}`}>
                <i className={twoFA ? "fi fi-rr-check" : "fi fi-rr-lock"}></i>
              </div>
              <span className="text-[17px] font-bold">{twoFA ? t("security.twoFAOn") : t("security.twoFAOff")}</span>
            </div>
            
            <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-10 text-[15px]">
              {t("security.twoFANote")}
            </p>
            
            <div className="mt-auto">
              {twoFA ? (
                <button className="glass !bg-[var(--surface-1)] !text-[var(--text)] !border-[var(--border)] hover:!border-blue-400 hover:!text-blue-500 !py-4 !w-full !rounded-2xl font-bold transition-all">{t("security.twoFAConfigure")}</button>
              ) : (
                <button 
                  onClick={() => setTwoFA(true)}
                  className="btn-primary !bg-[var(--text)] !text-[var(--primary-contrast)] hover:!bg-[var(--text)] !py-4 !w-full !rounded-2xl shadow-lg"
                >
                  {t("security.twoFASetup")}
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
                <h3 className="text-[24px] font-black text-[var(--text)] mb-1 tracking-tight">{t("security.sessions")}</h3>
                <p className="text-[var(--text-muted)] font-medium">{t("security.sessionsDesc")}</p>
              </div>
            </div>
          </div>
          
          <div className="session-list space-y-6">
            {[
              { icon: "fi fi-rr-desktop", device: "Windows PC • Chrome", location: t("security.session.location"), current: true, time: t("security.session.activeNow") },
              { icon: "fi fi-rr-smartphone", device: "iPhone 13 • Safari", location: t("security.session.location"), current: false, time: t("profile.activity.hoursAgo").replace("{n}", "2") }
            ].map((session, idx) => (
              <div key={idx} className="session-item glass !bg-[var(--surface-1)] !border-[var(--border)] p-6 rounded-[30px] flex items-center gap-6 group hover:!border-[var(--primary)]/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center text-2xl group-hover:bg-orange-50 group-hover:text-[var(--primary)] transition-all">
                  <i className={session.icon}></i>
                </div>
                <div className="session-info flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[18px] font-black text-[var(--text)]">{session.device}</span>
                    {session.current && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-200">{t("security.sessionCurrent")}</span>}
                  </div>
                  <div className="text-[14px] font-bold text-[var(--text-muted)] flex items-center gap-2">
                    <i className="fi fi-rr-marker text-[12px]"></i> {session.location} • {session.time}
                  </div>
                </div>
                {!session.current && (
                  <button className="w-12 h-12 rounded-xl text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-all" title={t("security.session.logoutDevice")}>
                    <i className="fi fi-rr-exit text-xl"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="card-footer mt-10 pt-8 border-top border-[var(--border)]/50 flex justify-center">
            <button className="text-[15px] font-black text-red-500 hover:text-red-600 hover:underline px-8 py-3 rounded-full hover:bg-red-50 transition-all">{t("security.sessionLogoutOthers")}</button>
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

