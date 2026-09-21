"use client";
import SectionCard from "@/components/common/section-card";
import DetailRow from "@/components/common/detail-row";
import Money from "@/components/common/money";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import LinkButton from "@/components/common/link-button";
import { formatDate } from "@/lib/utils/format";
import { useUpcomingInvoice } from "@/lib/hooks/use-invoices";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

export default function NextInvoice() {
    const subscription = useCurrentSubscription();
    const upcoming = useUpcomingInvoice(Boolean(subscription.data));
    const isError = subscription.isError || upcoming.isError;
    const error = subscription.error ?? upcoming.error;
    const retry = () =>
        void (subscription.isError
            ? subscription.refetch()
            : upcoming.refetch());

    return (
        <SectionCard
            title="Next invoice"
            description="Estimated for the current billing period."
            action={
                <LinkButton href="/invoices" tone="quiet" size="sm">
                    All invoices
                </LinkButton>
            }
        >
            {upcoming.isPending && subscription.data && <Skeleton lines={2} />}

            {isError && <ErrorState error={error} onRetry={retry} />}

            {!isError && !upcoming.data && !upcoming.isPending && (
                <EmptyState
                    title="Nothing due yet"
                    description="An estimate appears once a billing period is under way."
                />
            )}

            {upcoming.data && (
                <dl className="flex flex-col">
                    {upcoming.data.overageAmount > 0 && (
                        <DetailRow label="Plan">
                            <Money amount={upcoming.data.baseAmount} />
                        </DetailRow>
                    )}
                    {upcoming.data.overageAmount > 0 && (
                        <DetailRow label="Overage so far">
                            <Money amount={upcoming.data.overageAmount} />
                        </DetailRow>
                    )}
                    <DetailRow label="Estimated amount">
                        <Money amount={upcoming.data.amount} showCurrency />
                    </DetailRow>
                    <DetailRow label="Due">
                        {formatDate(upcoming.data.dueDate)}
                    </DetailRow>
                </dl>
            )}
        </SectionCard>
    );
}
