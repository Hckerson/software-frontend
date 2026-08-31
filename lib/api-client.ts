import axios from "axios";
import { ApiError } from "@/lib/errors/api-error";
import {
    API_BASE_URL,
    AUTH_PATH_PREFIX,
    HTTP_STATUS,
    LOGIN_PATH,
} from "@/lib/constants";
import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import type { ApiErrorBody, ApiResponse } from "@/lib/types";

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const isOnAuthRoute = (): boolean =>
    typeof window !== "undefined" &&
    window.location.pathname.startsWith(AUTH_PATH_PREFIX);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
        if (
            error.response?.status === HTTP_STATUS.unauthorized &&
            typeof window !== "undefined" &&
            !isOnAuthRoute()
        ) {
            window.location.href = LOGIN_PATH;
        }

        return Promise.reject(ApiError.from(error));
    },
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<ApiResponse<T>> =
        await apiClient.request(config);

    return response.data.data;
};

export const query = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ method: "GET", url, ...config }),
    post: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
        request<T>({ method: "POST", url, data: body, ...config }),
    patch: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
        request<T>({ method: "PATCH", url, data: body, ...config }),
    put: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
        request<T>({ method: "PUT", url, data: body, ...config }),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ method: "DELETE", url, ...config }),
};
