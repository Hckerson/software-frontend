import { useState, useEffect } from "react";

export function useDebouncedSearch(
    initialValue: string = "",
    delay: number = 300,
) {
    const [search, setSearch] = useState(initialValue);
    const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, delay);

        return () => clearTimeout(timer);
    }, [search, delay]);

    return { search, setSearch, debouncedSearch };
}
