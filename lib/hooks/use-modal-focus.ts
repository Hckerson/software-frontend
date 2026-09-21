import { useEffect, useRef } from "react";

export const useModalFocus = <T extends HTMLElement>(
    open: boolean,
    onDismiss: () => void,
) => {
    const initialFocusRef = useRef<T>(null);
    const onDismissRef = useRef(onDismiss);

    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);

    useEffect(() => {
        if (!open) return;

        const trigger =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        initialFocusRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onDismissRef.current();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            trigger?.focus();
        };
    }, [open]);

    return initialFocusRef;
};
