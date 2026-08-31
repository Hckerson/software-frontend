"use client";
import { CircleCheck } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Money from "@/components/common/money";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import PeriodRange from "@/components/common/period-range";
import { formatDate } from "@/lib/utils/format";
import { useOverdueInvoices } from "@/lib/hooks/use-admin";
import type { Column, Invoice } from "@/lib/types";

const columns: Column<Invoice>[] = [
    { key: "customer", header: "Customer", render: (row) => row.userId },
    {
        key: "period",
        header: "Billing period",
        render: (row) => (
            <PeriodRange
                start={row.billingPeriodStart}
                end={row.billingPeriodEnd}
            />
        ),
    },
    {
        key: "amount",
        header: "Amount",
        render: (row) => <Money amount={row.amount} />,
    },
    { key: "due", header: "Due", render: (row) => formatDate(row.dueDate) },
];

export default function AdminOverdueInvoices() {
    const { data, isPending, isError, error, refetch } = useOverdueInvoices();
    const rows = data ?? [];

    return (
        <SectionCard
            title="Overdue invoices"
            description="Revenue at risk. Read-only; resolve through support tooling."
            bodyless={rows.length > 0}
        >
            {isPending && <Skeleton lines={4} className="p-3" />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && rows.length === 0 && (
                <EmptyState
                    icon={CircleCheck}
                    title="Nothing overdue"
                    description="Every invoice is either paid or still within its due date."
                />
            )}

            {rows.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(row) => row.id}
                />
            )}
        </SectionCard>
    );
}
