"use client";
import SectionCard from "@/components/common/section-card";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import LinkButton from "@/components/common/link-button";
import SubscriptionFacts from "@/components/sections/subscription/subscription-facts";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

export default function PlanSummary() {
    const { data, isPending } = useCurrentSubscription();

    return (
        <SectionCard
            title="Current plan"
            action={
                data ? (
                    <LinkButton href="/subscription" tone="quiet" size="sm">
                        Manage
                    </LinkButton>
                ) : undefined
            }
        >
            {isPending && <Skeleton lines={4} />}

            {!isPending && !data && (
                <EmptyState
                    title="No active plan"
                    description="Pick a plan to activate billing."
                    action={<LinkButton href="/plans">Browse plans</LinkButton>}
                />
            )}

            {data && <SubscriptionFacts subscription={data} />}
        </SectionCard>
    );
}
