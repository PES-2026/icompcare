import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";
import axios from "axios";
import { ApiError } from "./apiError";

declare module "axios" {
  export interface AxiosRequestConfig {
    fallbackMsg?: string;
    preserveSessionOn401?: boolean;
    skipGlobalLoader?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (!config.skipGlobalLoader) {
      useLoadingStore.getState().startRequest();
    }
    return config;
  },
  (error) => {
    useLoadingStore.getState().finishRequest();
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (!response.config.skipGlobalLoader) {
      useLoadingStore.getState().finishRequest();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipGlobalLoader) {
      useLoadingStore.getState().finishRequest();
    }

    const status = error.response?.status as number | undefined;
    const responseData = error.response?.data as
      | { message?: string; code?: string; details?: unknown }
      | undefined;

    if (status === 401 && !error.config?.preserveSessionOn401) {
      useAuthStore.getState().clearUser();
    }

    return Promise.reject(
      new ApiError(
        responseData?.message ??
          error.config?.fallbackMsg ??
          "Ocorreu um erro inesperado de comunicação.",
        status,
        responseData?.code,
        responseData?.details,
      ),
    );
  },
);

export default api;
