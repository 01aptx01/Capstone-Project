import type { AdminUserInfo } from "@/lib/admin-api";

export type ProfileFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  roles: string[];
  joined: string;
};

export function formatAdminRoles(roles: string[]): string {
  const r = roles.map((x) => (x || "").toLowerCase());
  if (r.includes("superadmin")) return "Super Admin";
  if (r.includes("admin")) return "Admin";
  if (roles.length) return roles.join(", ");
  return "—";
}

export function userToProfileForm(
  u: AdminUserInfo,
  locale: string,
): ProfileFormState {
  const joined = u.created_at
    ? new Date(u.created_at).toLocaleDateString(
        locale === "th" ? "th-TH" : "en-US",
        { month: "long", year: "numeric" },
      )
    : "—";

  return {
    first_name: u.first_name || "",
    last_name: u.last_name || "",
    email: u.email || "",
    phone: u.phone || "",
    position: u.position || "",
    roles: u.roles || [],
    joined,
  };
}

export function profileDisplayName(form: ProfileFormState): string {
  const full = `${form.first_name} ${form.last_name}`.trim();
  return full || form.email || "—";
}

export function profileDisplaySubtitle(form: ProfileFormState): string {
  if (form.position.trim()) return form.position.trim();
  return formatAdminRoles(form.roles);
}
