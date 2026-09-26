"use client";
import { History } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import StatusPill from "@/components/common/status-pill";
import PeriodRange from "@/components/common/period-range";
import { EMPTY_VALUE } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import { useSubscriptionHistory } from "@/lib/hooks/use-subscription";
import type { Column, Subscription } from "@/lib/types";

const columns: Column<Subscription>[] = [
    {
        key: "plan",
        header: "Plan",
        render: (row) => row.plan?.name ?? EMPTY_VALUE,
    },
    {
        key: "period",
        header: "Billing period",
        render: (row) => (
            <PeriodRange
                start={row.currentBillingPeriodStart}
                end={row.currentBillingPeriodEnd}
            />
        ),
    },
    {
        key: "started",
        header: "Started",
        render: (row) => formatDate(row.startDate),
    },
    {
        key: "status",
        header: "Status",
        render: (row) => <StatusPill status={row.status} />,
    },
];

export default function SubscriptionHistory() {
    const { data, isPending, isError, error, refetch } =
        useSubscriptionHistory();
    const rows = data ?? [];

    return (
        <SectionCard title="History" bodyless={rows.length > 0}>
            {isPending && <Skeleton lines={3} className="p-3" />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && rows.length === 0 && (
                <EmptyState
                    icon={History}
                    title="No history yet"
                    description="Plan changes and cancellations appear here."
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
