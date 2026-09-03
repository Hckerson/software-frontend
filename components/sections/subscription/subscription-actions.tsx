"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import SectionCard from "@/components/common/section-card";
import ErrorState from "@/components/common/error-state";
import LinkButton from "@/components/common/link-button";
import ConfirmDialog from "@/components/common/confirm-dialog";
import {
    useCancelSubscription,
    useCurrentSubscription,
    useReactivateSubscription,
} from "@/lib/hooks/use-subscription";

const CANCELED = "CANCELED";

export default function SubscriptionActions() {
    const { data } = useCurrentSubscription();
    const cancel = useCancelSubscription();
    const reactivate = useReactivateSubscription();
    const [isConfirming, setIsConfirming] = useState(false);

    if (!data) return null;

    const isCanceled = data.status === CANCELED;

    return (
        <SectionCard
            title={isCanceled ? "Reactivate" : "Cancel subscription"}
            description={
                isCanceled
                    ? "Your subscription is cancelled. Reactivating restores it on the current plan."
                    : "Cancelling stops renewal. You can reactivate while the subscription still exists."
            }
        >
            {cancel.isError && <ErrorState error={cancel.error} />}
            {reactivate.isError && <ErrorState error={reactivate.error} />}

            <div className="flex flex-wrap items-center gap-2">
                {isCanceled ? (
                    <Button
                        isLoading={reactivate.isPending}
                        onClick={() => reactivate.mutate()}
                    >
                        Reactivate subscription
                    </Button>
                ) : (
                    <Button
                        tone="danger"
                        onClick={() => setIsConfirming(true)}
                        isLoading={cancel.isPending}
                    >
                        Cancel subscription
                    </Button>
                )}
                <LinkButton href="/plans" tone="quiet">
                    Change plan instead
                </LinkButton>
            </div>

            <ConfirmDialog
                open={isConfirming}
                title="Cancel your subscription"
                description="Renewal stops at the end of the current billing period. You can reactivate at any time while the subscription record exists."
                confirmLabel="Cancel subscription"
                isPending={cancel.isPending}
                onConfirm={() =>
                    cancel.mutate(undefined, {
                        onSuccess: () => setIsConfirming(false),
                    })
                }
                onCancel={() => setIsConfirming(false)}
            />
        </SectionCard>
    );
}
