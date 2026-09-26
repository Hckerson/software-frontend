"use client";
import { useState } from "react";
import { Layers } from "lucide-react";
import Button from "@/components/common/button";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Money from "@/components/common/money";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import StatusPill from "@/components/common/status-pill";
import ConfirmDialog from "@/components/common/confirm-dialog";
import AdminPlanEdit from "@/components/sections/admin/admin-plan-edit";
import { titleCase } from "@/lib/utils/format";
import {
    useDeletePlan,
    usePlans,
    useSetPlanActive,
} from "@/lib/hooks/use-plans";
import type { Column, SubscriptionPlan } from "@/lib/types";

export default function AdminPlanList() {
    const plans = usePlans();
    const setActive = useSetPlanActive();
    const remove = useDeletePlan();
    const [pending, setPending] = useState<SubscriptionPlan | null>(null);
    const [editing, setEditing] = useState<SubscriptionPlan | null>(null);

    const columns: Column<SubscriptionPlan>[] = [
        { key: "name", header: "Plan", render: (row) => row.name },
        {
            key: "tier",
            header: "Tier",
            render: (row) => titleCase(row.planType),
        },
        {
            key: "price",
            header: "Price",
            render: (row) => <Money amount={row.priceUSD} />,
        },
        {
            key: "state",
            header: "State",
            render: (row) => (
                <StatusPill status={row.isActive ? "ACTIVE" : "SUSPENDED"} />
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        tone="quiet"
                        onClick={() => setEditing(row)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        tone="quiet"
                        onClick={() =>
                            setActive.mutate({
                                id: row.id,
                                isActive: !row.isActive,
                            })
                        }
                    >
                        {row.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                        size="sm"
                        tone="ghost"
                        onClick={() => setPending(row)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const rows = plans.data ?? [];

    return (
        <SectionCard title="Plan catalogue" bodyless={rows.length > 0}>
            {plans.isPending && <Skeleton lines={4} className="p-3" />}

            {plans.isError && (
                <ErrorState
                    error={plans.error}
                    onRetry={() => void plans.refetch()}
                />
            )}

            {!plans.isPending && !plans.isError && rows.length === 0 && (
                <EmptyState
                    icon={Layers}
                    title="No plans yet"
                    description="Create a plan before customers can subscribe."
                />
            )}

            {rows.length > 0 && (
                <DataTable
                    columns={columns}
                    rows={rows}
                    rowKey={(row) => row.id}
                />
            )}

            <ConfirmDialog
                open={Boolean(pending)}
                title={`Delete ${pending?.name ?? "plan"}`}
                description="Subscriptions reference this plan. Deactivating is safer and keeps history intact. Deleting cannot be undone."
                confirmLabel="Delete permanently"
                isPending={remove.isPending}
                onConfirm={() =>
                    pending &&
                    remove.mutate(pending.id, {
                        onSuccess: () => setPending(null),
                    })
                }
                onCancel={() => setPending(null)}
            />

            {editing && (
                <AdminPlanEdit
                    key={editing.id}
                    plan={editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </SectionCard>
    );
}
