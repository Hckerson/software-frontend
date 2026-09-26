"use client";
import { useState } from "react";
import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import ConfirmDialog from "@/components/common/confirm-dialog";
import PlanCard from "@/components/sections/plans/plan-card";
import { usePlans } from "@/lib/hooks/use-plans";
import {
    useChangePlan,
    useCurrentSubscription,
    useSelectPlan,
} from "@/lib/hooks/use-subscription";
import { HOME_PATH } from "@/lib/constants";
import type { SubscriptionPlan } from "@/lib/types";

export default function PlanCatalog() {
    const router = useRouter();
    const plans = usePlans();
    const subscription = useCurrentSubscription();
    const selectPlan = useSelectPlan();
    const changePlan = useChangePlan();
    const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(
        null,
    );

    const current = subscription.data;
    const isChange = Boolean(current);
    const mutation = isChange ? changePlan : selectPlan;

    const confirm = () => {
        if (!pendingPlan) return;

        const onSuccess = () => {
            setPendingPlan(null);
            router.push(HOME_PATH);
        };

        if (isChange) {
            changePlan.mutate({ newPlanId: pendingPlan.id }, { onSuccess });
            return;
        }

        selectPlan.mutate({ planId: pendingPlan.id }, { onSuccess });
    };

    if (plans.isPending) return <Skeleton lines={6} />;

    if (plans.isError) {
        return (
            <ErrorState
                error={plans.error}
                onRetry={() => void plans.refetch()}
            />
        );
    }

    const available = (plans.data ?? []).filter((plan) => plan.isActive);

    if (available.length === 0) {
        return (
            <EmptyState
                icon={Layers}
                title="No plans are available"
                description="An administrator needs to publish a plan before you can subscribe."
            />
        );
    }

    return (
        <>
            {mutation.isError && <ErrorState error={mutation.error} />}

            <div className="plan-grid">
                {available.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={plan.id === current?.planId}
                        actionLabel={
                            isChange ? "Switch to this plan" : "Choose plan"
                        }
                        isPending={
                            mutation.isPending && pendingPlan?.id === plan.id
                        }
                        onSelect={setPendingPlan}
                    />
                ))}
            </div>

            <ConfirmDialog
                open={Boolean(pendingPlan)}
                title={isChange ? "Switch plan" : "Confirm your plan"}
                description={
                    isChange
                        ? `Your subscription moves to ${pendingPlan?.name} and billing is prorated from the change date.`
                        : `You are subscribing to ${pendingPlan?.name}. You can change or cancel at any time.`
                }
                confirmLabel={isChange ? "Switch plan" : "Subscribe"}
                isPending={mutation.isPending}
                onConfirm={confirm}
                onCancel={() => setPendingPlan(null)}
            />
        </>
    );
}
