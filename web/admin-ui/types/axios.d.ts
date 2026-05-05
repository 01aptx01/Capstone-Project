import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** When true, the global error toast in lib/axios.ts is not shown (use local try/catch toasts). */
    skipGlobalErrorToast?: boolean;
  }
}
