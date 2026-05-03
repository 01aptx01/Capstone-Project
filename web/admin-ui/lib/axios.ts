import axios, { type AxiosError } from "axios";

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
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Request failed";
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn("[api]", err.config?.method?.toUpperCase(), err.config?.url, msg);
    }
    return Promise.reject(err);
  }
);
