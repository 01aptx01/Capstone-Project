"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { applyDarkModeClass, getStoredDarkMode, setStoredDarkMode } from "@/lib/theme";
import { useLang } from "@/lib/i18n/lang";
import type { Lang } from "@/lib/i18n/dictionaries";

// ── Portal wrapper ────────────────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-14 h-7 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--border)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface-1)] after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]" />
    </label>
  );
}

export default function SettingsView() {
  const { lang, setLang, t } = useLang();
  const [activeTab, setActiveTab] = useState("general");
  const [mounted, setMounted] = useState(false);

  // General
  const [notifications, setNotifications] = useState({ inventory: true, system: true });
  const [appearance, setAppearance] = useState({ darkMode: false, language: "th" as Lang });

  // Security
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [phoneState, setPhoneState] = useState({ current: "081-234-5678", newPhone: "", otp: "", step: "input" as "input" | "otp" | "success" });

  // Admin Permissions
  const [isFirstAdmin] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: "", tempPassword: "" });
  const [admins, setAdmins] = useState([
    { id: 1, email: "manager@example.com", status: "Active" },
    { id: 2, email: "newhire@example.com",  status: "Pending" },
  ]);
  const [revokeTarget, setRevokeTarget] = useState<{ id: number; email: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Mount fade-in
  useEffect(() => { setMounted(true); }, []);

  // Init theme from storage
  useEffect(() => {
    const stored = getStoredDarkMode();
    if (stored === null) return;
    setAppearance((s) => ({ ...s, darkMode: stored }));
    applyDarkModeClass(stored);
  }, []);

  // Sync language from URL
  useEffect(() => {
    setAppearance((s) => ({ ...s, language: lang }));
  }, [lang]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = revokeTarget ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [revokeTarget]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPwMsg({ type: "success", text: "Password changed successfully." });
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPwMsg(null), 3000);
  };

  const handlePhoneSubmit = () => {
    if (phoneState.step === "input" && phoneState.newPhone) {
      setPhoneState(s => ({ ...s, step: "otp" }));
    } else if (phoneState.step === "otp" && phoneState.otp.length >= 4) {
      setPhoneState(s => ({ ...s, step: "success", current: s.newPhone, newPhone: "", otp: "" }));
      showToast("Phone number updated successfully.");
      setTimeout(() => setPhoneState(s => ({ ...s, step: "input" })), 2500);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email) return;
    setAdmins(prev => [...prev, { id: Date.now(), email: inviteForm.email, status: "Pending" }]);
    showToast(`Invitation sent to ${inviteForm.email}`);
    setInviteForm({ email: "", tempPassword: "" });
  };

  const confirmRevoke = () => {
    if (!revokeTarget) return;
    setAdmins(prev => prev.filter(a => a.id !== revokeTarget.id));
    showToast(`Access revoked for ${revokeTarget.email}`);
    setRevokeTarget(null);
  };

  const inputCls = "w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:border-[var(--primary)] outline-none transition-all text-[14px] font-medium";
  const cardCls = "bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]";
  const tabs = [
    { id: "general", label: t("settings.tabs.general") },
    { id: "security", label: t("settings.tabs.security") },
    { id: "admin", label: t("settings.tabs.admin") },
  ];

  return (
    <>
      <div
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.35s ease-out" }}
        className="max-w-[1200px] py-6"
      >
        <div className="mb-8">
          <h1 className="text-[32px] font-black text-[var(--text)] mb-2 tracking-tight">{t("settings.title")}</h1>
          <p className="text-[var(--text-muted)] text-[15px] font-medium">{t("settings.subtitle")}</p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-bold text-[15px] border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── GENERAL TAB ── */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
            <div className={cardCls}>
              <h3 className="text-[18px] font-black text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-xl"><i className="fi fi-rr-palette" /></div>
                {t("settings.displayTitle")}
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--border)]">
                  <div>
                    <div className="font-bold text-[var(--text)] text-[15px]">{t("settings.darkModeTitle")}</div>
                    <div className="text-[var(--text-muted)] text-[13px] mt-1">{t("settings.darkModeDesc")}</div>
                  </div>
                  <Toggle
                    checked={appearance.darkMode}
                    onChange={() => {
                      const next = !appearance.darkMode;
                      setAppearance((s) => ({ ...s, darkMode: next }));
                      setStoredDarkMode(next);
                      applyDarkModeClass(next);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[var(--text)] text-[15px]">{t("settings.languageTitle")}</div>
                    <div className="text-[var(--text-muted)] text-[13px] mt-1">{t("settings.languageDesc")}</div>
                  </div>
                  <select
                    value={appearance.language}
                    onChange={(e) => setLang((e.target.value as Lang) === "en" ? "en" : "th")}
                    className="px-4 py-2 border border-[var(--border)] rounded-xl font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="th">ไทย (Thai)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="text-[18px] font-black text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-xl">                <i className="fi fi-rr-bell" /></div>
                {t("settings.notif.title")}
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[var(--border)]">
                  <div>
                    <div className="font-bold text-[var(--text)] text-[15px]">{t("settings.notif.lowStockTitle")}</div>
                    <div className="text-[var(--text-muted)] text-[13px] mt-1">{t("settings.notif.lowStockDesc")}</div>
                  </div>
                  <Toggle checked={notifications.inventory} onChange={() => setNotifications(s => ({ ...s, inventory: !s.inventory }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[var(--text)] text-[15px]">{t("settings.notif.systemTitle")}</div>
                    <div className="text-[var(--text-muted)] text-[13px] mt-1">{t("settings.notif.systemDesc")}</div>
                  </div>
                  <Toggle checked={notifications.system} onChange={() => setNotifications(s => ({ ...s, system: !s.system }))} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
            <div className={`${cardCls} h-max`}>
              <h3 className="text-[18px] font-black text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-xl">                <i className="fi fi-rr-lock" /></div>
                {t("settings.password.title")}
              </h3>
              {pwMsg && (
                <div className={`px-4 py-3 rounded-xl text-[13px] font-bold mb-4 flex items-center gap-2 ${pwMsg.type === "success" ? "bg-[var(--success-bg)] border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-600"}`}>
                  <i className={`fi ${pwMsg.type === "success" ? "fi-rr-check" : "fi-rr-exclamation"}`} />
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.password.current")}</label>
                  <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm(s => ({ ...s, current: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.password.new")}</label>
                  <input type="password" required value={passwordForm.newPass} onChange={e => setPasswordForm(s => ({ ...s, newPass: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.password.confirm")}</label>
                  <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm(s => ({ ...s, confirm: e.target.value }))} className={inputCls} />
                </div>
                <button type="submit" className="w-full py-3.5 bg-[var(--primary)] text-[var(--primary-contrast)] font-bold rounded-xl shadow-lg  hover:-translate-y-0.5 transition-all mt-2">
                  {t("settings.password.submit")}
                </button>
              </form>
            </div>

            <div className={`${cardCls} h-max`}>
              <h3 className="text-[18px] font-black text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-xl">                <i className="fi fi-rr-smartphone" /></div>
                {t("settings.phone.title")}
              </h3>
              {phoneState.step === "success" ? (
                <div className="bg-[var(--success-bg)] border border-emerald-200 text-emerald-700 p-6 rounded-2xl flex flex-col items-center gap-3 animate-in zoom-in-95">
                  <i className="fi fi-rr-check-circle text-4xl" />
                  <div className="font-bold">{t("settings.phone.successTitle")}</div>
                  <div className="text-[14px]">{t("settings.phone.newLabel")} {phoneState.current}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl">
                    <div className="text-[12px] font-bold text-[var(--text-muted)]">{t("settings.phone.currentLabel")}</div>
                    <div className="font-black text-[var(--text)] text-[16px]">{phoneState.current}</div>
                  </div>
                  {phoneState.step === "input" && (
                    <div className="animate-in slide-in-from-right-4">
                      <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.phone.newField")}</label>
                      <input type="text" placeholder={t("settings.phone.placeholder")} value={phoneState.newPhone} onChange={e => setPhoneState(s => ({ ...s, newPhone: e.target.value }))} className={`${inputCls} mb-4`} />
                      <button onClick={handlePhoneSubmit} className="w-full py-3.5 bg-[var(--text)] text-[var(--primary-contrast)] font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">{t("settings.phone.sendOtp")}</button>
                    </div>
                  )}
                  {phoneState.step === "otp" && (
                    <div className="animate-in slide-in-from-right-4">
                      <div className="text-[13px] text-[var(--text)] mb-4 font-medium">{t("settings.phone.otpHint")} <span className="font-bold text-[var(--primary)]">{phoneState.newPhone}</span></div>
                      <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.phone.otpLabel")}</label>
                      <input type="text" maxLength={6} value={phoneState.otp} onChange={e => setPhoneState(s => ({ ...s, otp: e.target.value }))} className={`${inputCls} text-center tracking-[0.5em] font-black text-xl mb-4`} />
                      <div className="flex gap-3">
                        <button onClick={() => setPhoneState(s => ({ ...s, step: "input" }))} className="px-6 py-3.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)] font-bold rounded-xl hover:bg-[var(--surface-2)] transition-all">{t("common.cancel")}</button>
                        <button onClick={handlePhoneSubmit} className="flex-1 py-3.5 bg-[var(--primary)] text-[var(--primary-contrast)] font-bold rounded-xl shadow-lg  hover:-translate-y-0.5 transition-all">{t("settings.phone.confirmOtp")}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADMIN PERMISSIONS TAB ── */}
        {activeTab === "admin" && (
          <div className="animate-in slide-in-from-left-4 duration-300">
            {!isFirstAdmin ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-2xl flex flex-col items-center gap-3">
                <i className="fi fi-rr-lock text-4xl" />
                <h3 className="font-black text-xl">{t("settings.admin.deniedTitle")}</h3>
                <p className="font-medium text-[15px]">{t("settings.admin.deniedDesc")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Invite Form */}
                <div className="lg:col-span-4">
                  <div className={cardCls}>
                    <h3 className="text-[18px] font-black text-[var(--text)] mb-2">{t("settings.admin.inviteTitle")}</h3>
                    <p className="text-[var(--text-muted)] text-[13px] mb-6">{t("settings.admin.inviteDesc")}</p>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("common.email")}</label>
                        <input type="email" required placeholder="admin@example.com" value={inviteForm.email} onChange={e => setInviteForm(s => ({ ...s, email: e.target.value }))} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[var(--text-muted)] mb-2">{t("settings.admin.tempPasswordLabel")}</label>
                        <input type="text" required placeholder={t("settings.admin.tempPasswordPlaceholder")} value={inviteForm.tempPassword} onChange={e => setInviteForm(s => ({ ...s, tempPassword: e.target.value }))} className={inputCls} />
                      </div>
                      <button type="submit" className="w-full py-3.5 bg-[var(--primary)] text-[var(--primary-contrast)] font-bold rounded-xl shadow-lg  hover:-translate-y-0.5 transition-all mt-2">
                        {t("settings.admin.sendInvite")}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Authorized Admin List */}
                <div className="lg:col-span-8">
                  <div className={cardCls}>
                    <h3 className="text-[18px] font-black text-[var(--text)] mb-6">{t("settings.admin.listTitle")}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                            <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">{t("common.email")}</th>
                            <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">{t("common.status")}</th>
                            <th className="px-6 py-4 text-[12px] font-black text-[var(--text-muted)] uppercase tracking-wider text-right whitespace-nowrap">{t("common.actions")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-[var(--surface-2)] transition-colors">
                              <td className="px-6 py-4 font-bold text-[var(--text)]">{admin.email}</td>
                              <td className="px-6 py-4">
                                {admin.status === "Active" ? (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[12px] font-bold">Active</span>
                                ) : (
                                  <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[12px] font-bold">Pending</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setRevokeTarget({ id: admin.id, email: admin.email })}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-1)] border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg text-[13px] font-bold transition-all"
                                >
                                  <i className="fi fi-rr-ban text-[12px]" />
                                  {t("settings.admin.revoke")}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {admins.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] font-bold">{t("settings.admin.empty")}</td>
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
      </div>

      {/* ── Revoke Confirmation Modal (Portal → document.body) ─────────────────── */}
      {revokeTarget && (
        <Portal>
          <div
            onClick={e => { if (e.target === e.currentTarget) setRevokeTarget(null); }}
            className="animate-in fade-in duration-200"
            style={{
              position: "fixed", inset: 0, zIndex: 99999,
              display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
              background: "rgba(15,23,42,0.55)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <div className="bg-[var(--surface-1)] w-full max-w-sm rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <i className="fi fi-rr-ban text-xl" />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[var(--text)]">{t("settings.admin.revokeTitle")}</h3>
                  <p className="text-[var(--text-muted)] text-[13px] font-medium mt-0.5">{t("settings.admin.revokeWarn")}</p>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-6">
                <p className="text-[14px] font-bold text-[var(--text)]">{t("settings.admin.revokeConfirmText")}</p>
                <p className="text-[14px] font-black text-rose-600 mt-0.5 break-all">{revokeTarget.email}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRevokeTarget(null)} className="flex-1 px-4 py-3 bg-[var(--surface-2)] text-[var(--text)] rounded-xl font-bold hover:bg-[var(--border)] transition-all text-[14px]">
                  {t("common.cancel")}
                </button>
                <button onClick={confirmRevoke} className="flex-1 px-4 py-3 bg-rose-500 text-[var(--primary-contrast)] rounded-xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all text-[14px]">
                  {t("settings.admin.revokeYes")}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Success Toast (Portal → document.body) ─────────────────────────────── */}
      {toast && (
        <Portal>
          <div
            className="animate-in slide-in-from-bottom-4 duration-300"
            style={{
              position: "fixed", bottom: "24px", right: "24px", zIndex: 99999,
              display: "flex", alignItems: "center", gap: "12px",
              background: "var(--text)", color: "white",
              padding: "14px 20px", borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          >
            <div className="w-7 h-7 bg-[var(--success-bg)]0 rounded-full flex items-center justify-center shrink-0">
              <i className="fi fi-rr-check text-[13px]" />
            </div>
            <span className="font-bold text-[14px]">{toast}</span>
          </div>
        </Portal>
      )}
    </>
  );
}
