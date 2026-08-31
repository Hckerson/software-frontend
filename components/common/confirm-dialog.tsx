"use client";
import { useEffect, useRef } from "react";
import Button from "@/components/common/button";

interface Props {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isPending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    isPending = false,
    onConfirm,
    onCancel,
}: Props) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;

        confirmRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCancel();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className="dialog-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div className="dialog-panel">
                <h2 className="text-text font-display text-h6">{title}</h2>
                <p className="text-text-secondary text-sm">{description}</p>
                <footer className="flex justify-end gap-2">
                    <Button
                        tone="quiet"
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        ref={confirmRef}
                        onClick={onConfirm}
                        isLoading={isPending}
                    >
                        {confirmLabel}
                    </Button>
                </footer>
            </div>
        </div>
    );
}
