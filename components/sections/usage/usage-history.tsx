"use client";
import { Gauge } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import { formatCount, titleCase } from "@/lib/utils/format";
import { useUsageHistory } from "@/lib/hooks/use-usage";
import type { Column, UsageLog } from "@/lib/types";

const columns: Column<UsageLog>[] = [
    {
        key: "metric",
        header: "Metric",
        render: (row) => titleCase(row.metricType),
    },
    { key: "period", header: "Period", render: (row) => row.period },
    {
        key: "amount",
        header: "Recorded",
        render: (row) => formatCount(row.amount),
    },
];

export default function UsageHistory() {
    const { data, isPending, isError, error, refetch } = useUsageHistory();
    const rows = data ?? [];

    return (
        <SectionCard
            title="Usage history"
            description="One row per metric per billing period."
            bodyless={rows.length > 0}
        >
            {isPending && <Skeleton lines={4} className="p-3" />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && rows.length === 0 && (
                <EmptyState
                    icon={Gauge}
                    title="No usage recorded"
                    description="Usage appears here as soon as your account reports its first metric."
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
