"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { applyDarkModeClass, getStoredDarkMode, setStoredDarkMode } from "@/lib/theme";
import { useLang } from "@/lib/i18n/lang";
import type { Lang } from "@/lib/i18n/dictionaries";
import { inviteAdmin, listAdmins, revokeAdmin, type AdminListItem } from "@/lib/admin-api";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";

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
  const [isAdminSuper, setIsAdminSuper] = useState(false);

  // Decode JWT to check for superadmin email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload && payload.email === "admin@modpao.com") {
            setIsAdminSuper(true);
          }
        } catch (err) {
          console.error("Error decoding admin token:", err);
        }
      }
    }
  }, []);

  // General
  const [notifications, setNotifications] = useState({ inventory: true, system: true });
  const [appearance, setAppearance] = useState({ darkMode: false, language: "th" as Lang });

  const [phoneState, setPhoneState] = useState({ current: "081-234-5678", newPhone: "", otp: "", step: "input" as "input" | "otp" | "success" });

  // Admin Permissions
  const [isFirstAdmin] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: "", tempPassword: "" });
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ id: number; email: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Mount fade-in
  useEffect(() => { setMounted(true); }, []);

  // Fetch admins list from DB when tab changes to admin
  useEffect(() => {
    if (activeTab !== "admin") return;
    let active = true;
    const fetchList = async () => {
      setLoadingAdmins(true);
      try {
        const res = await listAdmins();
        if (active) setAdmins(res.admins);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingAdmins(false);
      }
    };
    fetchList();
    return () => { active = false; };
  }, [activeTab]);

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
  const handlePhoneSubmit = () => {
    if (phoneState.step === "input" && phoneState.newPhone) {
      setPhoneState(s => ({ ...s, step: "otp" }));
    } else if (phoneState.step === "otp" && phoneState.otp.length >= 4) {
      setPhoneState(s => ({ ...s, step: "success", current: s.newPhone, newPhone: "", otp: "" }));
      showToast("Phone number updated successfully.");
      setTimeout(() => setPhoneState(s => ({ ...s, step: "input" })), 2500);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.tempPassword) return;
    if (inviteForm.tempPassword.trim().length < 6) {
      showToast(t("settings.password.errorMinLength"));
      return;
    }
    try {
      await inviteAdmin(inviteForm.email, inviteForm.tempPassword);
      showToast(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: "", tempPassword: "" });
      const updated = await listAdmins();
      setAdmins(updated.admins);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      showToast(axiosErr?.response?.data?.error || "Failed to send invitation.");
    }
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeAdmin(revokeTarget.id);
      showToast(`Access revoked for ${revokeTarget.email}`);
      setRevokeTarget(null);
      const updated = await listAdmins();
      setAdmins(updated.admins);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      showToast(axiosErr?.response?.data?.error || "Failed to revoke access.");
    }
  };

  const inputCls = "w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:border-[var(--primary)] outline-none transition-all text-[14px] font-medium";
  const cardCls = "bg-[var(--surface-1)] border border-[var(--border)] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]";
  const tabs = [
    { id: "general", label: t("settings.tabs.general") },
    { id: "security", label: t("settings.tabs.security") },
    ...(isAdminSuper ? [{ id: "admin", label: t("settings.tabs.admin") }] : []),
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
          <div className="max-w-[600px] animate-in slide-in-from-left-4 duration-300">
            <div className={cardCls}>
              <h3 className="text-[18px] font-black text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--primary)] flex items-center justify-center text-xl">                <i className="fi fi-rr-lock" /></div>
                {t("settings.password.title")}
              </h3>
              <PasswordChangeForm inputClassName={inputCls} />
            </div>
          </div>
        )}

        {/* ── ADMIN PERMISSIONS TAB ── */}
        {activeTab === "admin" && isAdminSuper && (
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
                          {loadingAdmins ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] font-bold">
                                <i className="fi fi-rr-spinner animate-spin mr-2" />
                                Loading admins...
                              </td>
                            </tr>
                          ) : admins.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] font-bold">{t("settings.admin.empty")}</td>
                            </tr>
                          ) : (
                            admins.map(admin => (
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
                            ))
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
