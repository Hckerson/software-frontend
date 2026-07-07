import { create } from "zustand";
import { User } from "./interface";
import { persist } from "zustand/middleware";

export interface AuthState {
    user: User | null;
    logout: () => void;
    token: string | null;
    setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
                set({ user, token });
            },
            logout: () => {
                document.cookie = "auth-token=; path=/; max-age=0";
                set({ user: null, token: null });
            },
        }),
        {
            name: "auth-store",
        },
    ),
);
