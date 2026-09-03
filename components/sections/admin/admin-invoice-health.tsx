"use client";
import {
    CircleCheck,
    FileText,
    ReceiptText,
    TriangleAlert,
} from "lucide-react";
import StatCard from "@/components/common/stat-card";
import Skeleton from "@/components/common/skeleton";
import ErrorState from "@/components/common/error-state";
import { formatCount } from "@/lib/utils/format";
import { useInvoiceStats } from "@/lib/hooks/use-admin";

export default function AdminInvoiceHealth() {
    const { data, isPending, isError, error, refetch } = useInvoiceStats();

    if (isPending) return <Skeleton lines={3} />;

    if (isError) {
        return <ErrorState error={error} onRetry={() => void refetch()} />;
    }

    return (
        <div className="metric-grid">
            <StatCard
                label="Total invoices"
                value={formatCount(data.total)}
                icon={FileText}
                tone="activity"
            />
            <StatCard
                label="Paid"
                value={formatCount(data.paid)}
                meta={`${data.paidPercentage}% of all invoices`}
                icon={CircleCheck}
                tone="success"
            />
            <StatCard
                label="Overdue"
                value={formatCount(data.overdue)}
                icon={TriangleAlert}
                tone="warning"
            />
            <StatCard
                label="Draft"
                value={formatCount(data.draft)}
                icon={ReceiptText}
                tone="pipeline"
            />
        </div>
    );
}
