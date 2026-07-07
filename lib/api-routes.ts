// Example: API route configuration (replace with your actual endpoints)
export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
        auth: {
            login: "/auth/login",
            logout: "/auth/logout",
        },
        users: {
            all: "/users",
            detail: (id: string) => `/users/${id}`,
        },
    },
};
