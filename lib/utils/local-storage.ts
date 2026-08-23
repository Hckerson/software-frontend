export const storage = {
    setItem: (key: string, value: string) => {
        if (typeof window === "undefined") return;
        return localStorage.setItem(key, value);
    },
    getItem: (key: string) => {
        if (typeof window === "undefined") return;
        return localStorage.getItem(key);
    },
    removeItem: (key: string) => {
        if (typeof window === "undefined") return;
        return localStorage.removeItem(key);
    },
    clear: () => {
        if (typeof window === "undefined") return;
        return localStorage.clear();
    },
};
