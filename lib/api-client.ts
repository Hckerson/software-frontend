import axios from "axios";
import { useAuthStore } from "./auth-store";
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from "axios";

const defaultConfig: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
};

interface Response<T> {
    data: T;
    message: string;
    timestamp: string;
    statusCode: number;
}

export const apiClient: AxiosInstance = axios.create(defaultConfig);

const request = async <T>(config: AxiosRequestConfig): Promise<Response<T>> => {
    const defaultResponse: Response<T> = {
        data: [] as unknown as T,
        message: "",
        timestamp: new Date().toLocaleDateString("en-Us", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        statusCode: 200,
    };

    try {
        const response: AxiosResponse = await apiClient.request({
            ...defaultConfig,
            ...config,
        });
        return response.data as Response<T>;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Silently catch HTTP errors - component handles via isError/isLoading
            // Uncomment to debug: console.error(error.message);
        }
        return defaultResponse;
    }
};

export const query = {
    get: async <T>(url: string, config?: AxiosRequestConfig) => {
        return await request<T>({ method: "GET", url, ...config });
    },
    post: async <T>(
        url: string,
        body: unknown,
        config?: AxiosRequestConfig,
    ) => {
        return await request<T>({ method: "POST", url, data: body, ...config });
    },
    patch: async <T>(
        url: string,
        body: unknown,
        config?: AxiosRequestConfig,
    ) => {
        return await request<T>({
            method: "PATCH",
            url,
            data: body,
            ...config,
        });
    },
    put: async <T>(url: string, body: unknown, config?: AxiosRequestConfig) => {
        return await request<T>({ method: "PUT", url, data: body, ...config });
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig) => {
        return await request<T>({ method: "DELETE", url, ...config });
    },
};

apiClient.interceptors.request.use((config) => {
    // Extract token from Zustand store directly
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 Unauthorized responses
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear auth state on unauthorized
            useAuthStore.getState().logout();

            // Redirect to login if not already there
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.startsWith("/auth")
            ) {
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    },
);
