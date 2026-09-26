export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

export const DATE_DISPLAY_FORMAT = "d MMM yyyy";

export const DEFAULT_CURRENCY = "USD";

export const EMPTY_VALUE = "—";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const AUTH_COOKIE = "access_token";

export const THEME_KEY = "theme";

export const AUTH_PATH_PREFIX = "/auth";

export const LOGIN_PATH = "/auth/login";

export const HOME_PATH = "/dashboard";

export const ADMIN_PREFIX = "/admin";

export const ADMIN_ROLE = "ADMIN";

export const REDIRECT_PARAM = "next";

export const PROTECTED_PREFIXES = [
    "/dashboard",
    "/plans",
    "/subscription",
    "/usage",
    "/invoices",
    "/settings",
    "/admin",
] as const;

export const HTTP_STATUS = {
    unauthorized: 401,
    networkError: 0,
} as const;

export const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const USAGE_THRESHOLD = {
    warning: 75,
    exceeded: 100,
} as const;

export const MOTION_DURATION = {
    fast: 0.2,
    normal: 0.35,
    slow: 0.6,
    slower: 0.8,
} as const;

export const MOTION_SPRING = {
    type: "spring",
    stiffness: 100,
    damping: 30,
} as const;
