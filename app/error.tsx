"use client";
import Button from "@/components/common/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="auth-shell">
            <div className="empty-state" role="alert">
                <p className="micro-label text-text-muted">Error</p>
                <h1 className="text-text font-display text-h4">
                    Something went wrong
                </h1>
                <p className="text-text-secondary measure text-sm">
                    {error.message}
                </p>
                <Button onClick={reset}>Try again</Button>
            </div>
        </main>
    );
}
