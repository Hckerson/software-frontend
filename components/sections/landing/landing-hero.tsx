import { Gauge } from "lucide-react";
import LinkButton from "@/components/common/link-button";

export default function LandingHero() {
    return (
        <section className="landing-hero">
            <span className="text-accent flex items-center gap-2">
                <Gauge className="size-4" strokeWidth={1.5} />
                <span className="micro-label">Meter</span>
            </span>

            <h1 className="text-text font-display text-h2">
                Know what you owe before the invoice arrives
            </h1>

            <p className="text-text-secondary measure text-lg">
                Subscription billing with the meter in front. Watch API calls,
                storage and seats against your plan limits, and upgrade before
                you hit a ceiling — not after.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <LinkButton href="/auth/register" size="xl">
                    Get started
                </LinkButton>
                <LinkButton href="/auth/login" size="xl" tone="quiet">
                    Sign in
                </LinkButton>
            </div>
        </section>
    );
}
