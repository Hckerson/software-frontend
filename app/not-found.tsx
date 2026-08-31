import LinkButton from "@/components/common/link-button";

export default function NotFound() {
    return (
        <main className="auth-shell">
            <div className="empty-state">
                <p className="micro-label text-text-muted">404</p>
                <h1 className="text-text font-display text-h4">
                    We could not find that page
                </h1>
                <p className="text-text-secondary measure text-sm">
                    The link may be out of date, or the record may have been
                    removed.
                </p>
                <LinkButton href="/dashboard">Back to dashboard</LinkButton>
            </div>
        </main>
    );
}
