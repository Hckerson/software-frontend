"use client";
import { Layers } from "lucide-react";
import LinkButton from "@/components/common/link-button";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import MeterRow from "@/components/sections/usage/meter-row";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { useCurrentUsage } from "@/lib/hooks/use-usage";

export default function UsageSummary() {
    const subscription = useCurrentSubscription();
    const usage = useCurrentUsage(Boolean(subscription.data));

    if (subscription.isPending) return <Skeleton lines={4} />;

    if (subscription.isError) {
        return (
            <ErrorState
                error={subscription.error}
                onRetry={() => void subscription.refetch()}
            />
        );
    }

    if (!subscription.data) {
        return (
            <EmptyState
                icon={Layers}
                title="You do not have a plan yet"
                description="Choose a plan to start tracking usage against your limits."
                action={<LinkButton href="/plans">Choose a plan</LinkButton>}
            />
        );
    }

    return (
        <MeterRow
            limits={subscription.data.plan?.limits ?? {}}
            usage={usage.data ?? []}
        />
    );
}
