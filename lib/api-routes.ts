import { API_BASE_URL } from "@/lib/constants";

export const config = {
    api: {
        baseUrl: API_BASE_URL,
        auth: {
            login: "/api/auth/login",
            logout: "/api/auth/logout",
        },
        users: {
            all: "/api/users",
            detail: (id: string) => `/api/users/${id}`,
        },
    },
};
