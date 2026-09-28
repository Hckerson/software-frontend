import "server-only";
import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/constants";

export const backendFetch = async (path: string, init: RequestInit = {}) => {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;

    return fetch(`${API_BASE_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export const readJson = async (source: Request | Response): Promise<unknown> =>
    await source.json().catch(() => null);
