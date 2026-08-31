"use client";
import {
    AlertTriangle,
    CircleCheck,
    CircleSlash,
    Clock,
    Users,
} from "lucide-react";
import StatCard from "@/components/common/stat-card";
import Skeleton from "@/components/common/skeleton";
import ErrorState from "@/components/common/error-state";
import { formatCount } from "@/lib/utils/format";
import { useAdminStats, useBillingStats } from "@/lib/hooks/use-admin";

export default function AdminOverview() {
    const stats = useAdminStats();
    const billing = useBillingStats();

    if (stats.isPending) return <Skeleton lines={4} />;

    if (stats.isError) {
        return (
            <ErrorState
                error={stats.error}
                onRetry={() => void stats.refetch()}
            />
        );
    }

    const data = stats.data;

    return (
        <div className="metric-grid">
            <StatCard
                label="Total users"
                value={formatCount(data.totalUsers)}
                meta={`${formatCount(data.activeUsers)} active`}
                icon={Users}
                tone="activity"
            />
            <StatCard
                label="Active subscriptions"
                value={formatCount(data.activeSubscriptions)}
                meta={
                    billing.data
                        ? `${billing.data.churnRate} churn`
                        : "Loading churn"
                }
                icon={CircleCheck}
                tone="success"
            />
            <StatCard
                label="Past due"
                value={formatCount(data.pastDueSubscriptions)}
                meta={`${formatCount(data.canceledSubscriptions)} cancelled`}
                icon={Clock}
                tone="warning"
            />
            <StatCard
                label="Overdue invoices"
                value={formatCount(data.overdueInvoices)}
                meta={`${formatCount(data.suspendedUsers)} suspended accounts`}
                icon={data.overdueInvoices > 0 ? AlertTriangle : CircleSlash}
                tone="pipeline"
            />
        </div>
    );
}
