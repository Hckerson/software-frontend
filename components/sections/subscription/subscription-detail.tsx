"use client";
import { Layers } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import LinkButton from "@/components/common/link-button";
import SubscriptionFacts from "@/components/sections/subscription/subscription-facts";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

export default function SubscriptionDetail() {
    const { data, isPending, isError, error, refetch } =
        useCurrentSubscription();

    return (
        <SectionCard title="Subscription">
            {isPending && <Skeleton lines={5} />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && !data && (
                <EmptyState
                    icon={Layers}
                    title="No subscription"
                    description="You have not subscribed to a plan yet."
                    action={
                        <LinkButton href="/plans">Choose a plan</LinkButton>
                    }
                />
            )}

            {data && <SubscriptionFacts subscription={data} />}
        </SectionCard>
    );
}
