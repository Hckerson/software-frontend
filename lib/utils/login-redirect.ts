import { LOGIN_PATH, REDIRECT_PARAM } from "@/lib/constants";

export const loginTarget = (pathname: string, search: string): string => {
    const params = new URLSearchParams({
        [REDIRECT_PARAM]: `${pathname}${search}`,
    });

    return `${LOGIN_PATH}?${params.toString()}`;
};
