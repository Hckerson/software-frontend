"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import StatusPill from "@/components/common/status-pill";
import PeriodRange from "@/components/common/period-range";
import SelectInput from "@/components/ui/forms/select-input";
import IssueInvoiceButton from "@/components/sections/admin/issue-invoice-button";
import { EMPTY_VALUE } from "@/lib/constants";
import { SUBSCRIPTION_STATUS_OPTIONS } from "@/lib/data/status-options";
import { useAdminSubscriptions } from "@/lib/hooks/use-admin";
import type { Column, Subscription, SubscriptionStatus } from "@/lib/types";

const columns: Column<Subscription>[] = [
    {
        key: "customer",
        header: "Customer",
        render: (row) => row.user?.email ?? row.userId,
    },
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
        key: "status",
        header: "Status",
        render: (row) => <StatusPill status={row.status} />,
    },
    {
        key: "issue",
        header: "Invoice",
        render: (row) => <IssueInvoiceButton subscriptionId={row.id} />,
    },
];

export default function AdminSubscriptionList() {
    const [status, setStatus] = useState<string | undefined>(undefined);
    const { data, isPending, isError, error, refetch } = useAdminSubscriptions(
        (status as SubscriptionStatus | undefined) ?? "ALL",
    );
    const rows = data ?? [];

    return (
        <SectionCard
            title="All subscriptions"
            action={
                <div className="w-44">
                    <SelectInput
                        label="Status"
                        data={SUBSCRIPTION_STATUS_OPTIONS}
                        value={status}
                        handleChange={setStatus}
                    />
                </div>
            }
            bodyless={rows.length > 0}
        >
            {isPending && <Skeleton lines={5} className="p-3" />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && rows.length === 0 && (
                <EmptyState
                    icon={Users}
                    title="No subscriptions match"
                    description="Clear the status filter to see every subscription."
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
