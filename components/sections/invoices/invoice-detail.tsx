"use client";
import Button from "@/components/common/button";
import SectionCard from "@/components/common/section-card";
import DetailRow from "@/components/common/detail-row";
import Money from "@/components/common/money";
import PeriodRange from "@/components/common/period-range";
import StatusPill from "@/components/common/status-pill";
import Skeleton from "@/components/common/skeleton";
import ErrorState from "@/components/common/error-state";
import { EMPTY_VALUE } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import { useInvoice, useMarkInvoicePaid } from "@/lib/hooks/use-invoices";

const PAID = "PAID";

export default function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
    const { data, isPending, isError, error, refetch } = useInvoice(invoiceId);
    const markPaid = useMarkInvoicePaid();

    if (isPending) return <Skeleton lines={6} />;

    if (isError) {
        return <ErrorState error={error} onRetry={() => void refetch()} />;
    }

    return (
        <SectionCard
            title={`Invoice ${data.id.slice(0, 8)}`}
            action={
                data.status === PAID ? (
                    <StatusPill status={data.status} />
                ) : (
                    <Button
                        size="sm"
                        isLoading={markPaid.isPending}
                        onClick={() => markPaid.mutate(data.id)}
                    >
                        Mark as paid
                    </Button>
                )
            }
        >
            {markPaid.isError && <ErrorState error={markPaid.error} />}

            <dl className="flex flex-col">
                <DetailRow label="Amount">
                    <Money amount={data.amount} showCurrency />
                </DetailRow>
                <DetailRow label="Status">
                    <StatusPill status={data.status} />
                </DetailRow>
                <DetailRow label="Billing period">
                    <PeriodRange
                        start={data.billingPeriodStart}
                        end={data.billingPeriodEnd}
                    />
                </DetailRow>
                <DetailRow label="Due">{formatDate(data.dueDate)}</DetailRow>
                <DetailRow label="Paid">
                    {data.paidDate ? formatDate(data.paidDate) : EMPTY_VALUE}
                </DetailRow>
                <DetailRow label="Reference">
                    {data.stripeInvoiceId ?? EMPTY_VALUE}
                </DetailRow>
            </dl>
        </SectionCard>
    );
}
