type QueryValue = string | number | boolean | undefined;

export const queryString = (query: Record<string, QueryValue> = {}): string => {
    const params = new URLSearchParams();

    for (const [name, value] of Object.entries(query)) {
        if (value !== undefined) params.set(name, String(value));
    }

    const encoded = params.toString();
    return encoded ? `?${encoded}` : "";
};
