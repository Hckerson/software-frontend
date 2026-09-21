"use client";
import Money from "@/components/common/money";
import Skeleton from "@/components/common/skeleton";
import LinkButton from "@/components/common/link-button";
import PlanFeatureList from "@/components/sections/plans/plan-feature-list";
import { titleCase } from "@/lib/utils/format";
import { usePlans } from "@/lib/hooks/use-plans";

export default function LandingPlans() {
    const { data, isPending } = usePlans();
    const plans = (data ?? []).filter((plan) => plan.isActive);

    if (isPending) return <Skeleton lines={4} />;

    if (plans.length === 0) return null;

    return (
        <section className="landing-section flex flex-col gap-4">
            <h2 className="text-text font-display text-h3 text-center">
                Simple, metered pricing
            </h2>

            <div className="plan-grid">
                {plans.map((plan) => (
                    <article key={plan.id} className="section-card gap-3 p-4">
                        <span className="micro-label text-text-muted">
                            {titleCase(plan.planType)}
                        </span>
                        <h3 className="text-text font-display text-h6">
                            {plan.name}
                        </h3>
                        <p className="text-text font-display text-h5">
                            <Money amount={plan.priceUSD} />
                            <span className="text-text-muted text-sm">
                                {" / month"}
                            </span>
                        </p>
                        <PlanFeatureList
                            limits={plan.limits}
                            overageRates={plan.overageRates}
                            features={plan.features}
                        />
                        <LinkButton
                            href="/auth/register"
                            className="mt-auto"
                            tone="quiet"
                        >
                            Start with this plan
                        </LinkButton>
                    </article>
                ))}
            </div>
        </section>
    );
}
