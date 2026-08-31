"use client";
import SectionCard from "@/components/common/section-card";
import DetailRow from "@/components/common/detail-row";
import Money from "@/components/common/money";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import LinkButton from "@/components/common/link-button";
import { formatDate } from "@/lib/utils/format";
import { useUpcomingInvoice } from "@/lib/hooks/use-invoices";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

export default function NextInvoice() {
    const subscription = useCurrentSubscription();
    const upcoming = useUpcomingInvoice(Boolean(subscription.data));

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

            {!upcoming.data && !upcoming.isPending && (
                <EmptyState
                    title="Nothing due yet"
                    description="An estimate appears once a billing period is under way."
                />
            )}

            {upcoming.data && (
                <dl className="flex flex-col">
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
