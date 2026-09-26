import { storage } from "@/lib/utils/local-storage";
import { THEME_KEY } from "@/lib/constants";
import type { Theme } from "@/lib/types";

const DARK: Theme = "dark";
const LIGHT: Theme = "light";

export const systemTheme = (): Theme =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
        ? DARK
        : LIGHT;

export const storedTheme = (): Theme => {
    const saved = storage.getItem(THEME_KEY);

    return saved === DARK || saved === LIGHT ? saved : systemTheme();
};

export const applyTheme = (theme: Theme): void => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle(DARK, theme === DARK);
    storage.setItem(THEME_KEY, theme);
};

export const nextTheme = (theme: Theme): Theme =>
    theme === DARK ? LIGHT : DARK;
