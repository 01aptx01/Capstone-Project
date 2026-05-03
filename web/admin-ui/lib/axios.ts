import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type Method,
} from "axios";
import toast from "react-hot-toast";

function stripTrailingSlash(url: string | undefined): string | undefined {
  return url?.replace(/\/$/, "");
}

const baseURL =
  stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL) ||
  stripTrailingSlash(process.env.NEXT_PUBLIC_ADMIN_API_URL) ||
  "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});

export type AdminFetchInit = RequestInit & { skipGlobalErrorToast?: boolean };

function extractErrorMessage(
  err: AxiosError<{ message?: string; error?: string }>
): string {
  const d = err.response?.data;
  if (d && typeof d === "object") {
    if (typeof d.message === "string" && d.message) return d.message;
    if (typeof d.error === "string" && d.error) return d.error;
  }
  return err.message || "คำขอล้มเหลว กรุณาลองใหม่";
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("admin_token");
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string; error?: string }>) => {
    const status = err.response?.status;
    const cfg = err.config as AxiosRequestConfig | undefined;

    if (typeof window !== "undefined") {
      if (status === 401 || status === 403) {
        localStorage.removeItem("admin_token");
        const path = window.location.pathname || "";
        if (!path.startsWith("/login")) {
          window.location.assign("/login");
        }
        return Promise.reject(err);
      }

      if (!cfg?.skipGlobalErrorToast) {
        toast.error(extractErrorMessage(err));
      }
    } else if (process.env.NODE_ENV === "development") {
      console.warn(
        "[api]",
        err.config?.method?.toUpperCase(),
        err.config?.url,
        extractErrorMessage(err)
      );
    }

    return Promise.reject(err);
  }
);

/**
 * Admin REST under /api/admin/* using the shared Axios instance (auth + global error handling).
 */
export async function adminRequest<T>(
  path: string,
  init?: AdminFetchInit
): Promise<T> {
  const rel = path.startsWith("/") ? path : `/${path}`;
  const url = `/api/admin${rel}`;
  const method = (init?.method || "GET").toUpperCase() as Method;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...((init?.headers as Record<string, string>) || {}),
  };

  const cfg: AxiosRequestConfig = {
    url,
    method,
    headers,
    skipGlobalErrorToast: init?.skipGlobalErrorToast,
  };

  if (init?.body && method !== "GET" && method !== "HEAD") {
    if (typeof init.body === "string") {
      try {
        cfg.data = JSON.parse(init.body) as unknown;
      } catch {
        cfg.data = init.body;
      }
    } else {
      cfg.data = init.body;
    }
  }

  const { data } = await api.request<T>(cfg);
  return data as T;
}
