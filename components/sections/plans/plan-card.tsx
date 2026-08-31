"use client";
import clsx from "clsx";
import Button from "@/components/common/button";
import Money from "@/components/common/money";
import PlanFeatureList from "@/components/sections/plans/plan-feature-list";
import { titleCase } from "@/lib/utils/format";
import type { SubscriptionPlan } from "@/lib/types";

interface Props {
    plan: SubscriptionPlan;
    isCurrent: boolean;
    actionLabel: string;
    isPending: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}

export default function PlanCard({
    plan,
    isCurrent,
    actionLabel,
    isPending,
    onSelect,
}: Props) {
    return (
        <article
            className={clsx(
                "section-card gap-3 p-4",
                isCurrent && "border-accent",
            )}
        >
            <header className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <span className="micro-label text-text-muted">
                        {titleCase(plan.planType)}
                    </span>
                    <h3 className="text-text font-display text-h6">
                        {plan.name}
                    </h3>
                </div>
                {isCurrent && (
                    <span className="status-pill status-pill--success">
                        Current
                    </span>
                )}
            </header>

            <p className="text-text font-display text-h5">
                <Money amount={plan.priceUSD} />
                <span className="text-text-muted text-sm">{" / month"}</span>
            </p>

            {plan.description && (
                <p className="text-text-secondary text-xs">
                    {plan.description}
                </p>
            )}

            <PlanFeatureList limits={plan.limits} features={plan.features} />

            <Button
                className="mt-auto"
                tone={isCurrent ? "quiet" : "accent"}
                disabled={isCurrent}
                isLoading={isPending}
                onClick={() => onSelect(plan)}
            >
                {isCurrent ? "Your plan" : actionLabel}
            </Button>
        </article>
    );
}
