"use client";
import { Gauge } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import UsageTrendChart from "@/components/sections/usage/usage-trend-chart";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import { formatCount, titleCase } from "@/lib/utils/format";
import { seriesFor } from "@/lib/utils/chart";
import { limitFor } from "@/lib/utils/usage";
import { useUsageHistory } from "@/lib/hooks/use-usage";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
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
    const { data, isPending, isFetching, isError, error, refetch } =
        useUsageHistory();
    const subscription = useCurrentSubscription();
    const rows = data ?? [];
    const limits = subscription.data?.plan?.limits;
    const charts = METRIC_DESCRIPTORS.map((descriptor) => ({
        descriptor,
        points: seriesFor(rows, descriptor.metricType),
    })).filter(({ points }) => points.length > 0);

    return (
        <SectionCard
            title="Usage history"
            description="Each metric on its own scale, against your current plan's limit."
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
                <>
                    <div className="trend-grid p-3">
                        {charts.map(({ descriptor, points }) => (
                            <UsageTrendChart
                                key={descriptor.metricType}
                                label={descriptor.label}
                                unit={descriptor.unit}
                                points={points}
                                limit={
                                    limits === undefined
                                        ? undefined
                                        : limitFor(
                                              limits,
                                              descriptor.metricType,
                                          )
                                }
                                isRefreshing={isFetching && !isPending}
                            />
                        ))}
                    </div>
                    <details className="table-view">
                        <summary>Show the numbers as a table</summary>
                        <DataTable
                            columns={columns}
                            rows={rows}
                            rowKey={(row) => row.id}
                        />
                    </details>
                </>
            )}
        </SectionCard>
    );
}
