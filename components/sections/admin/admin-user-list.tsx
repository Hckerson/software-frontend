"use client";
import { useState } from "react";
import { UserSearch } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import DataTable from "@/components/common/data-table";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import StatusPill from "@/components/common/status-pill";
import FormField from "@/components/common/form-field";
import SelectInput from "@/components/ui/forms/select-input";
import AccountStatusButton from "@/components/sections/admin/account-status-button";
import { EMPTY_VALUE } from "@/lib/constants";
import { ACCOUNT_STATUS_OPTIONS } from "@/lib/data/status-options";
import { formatDate, titleCase } from "@/lib/utils/format";
import { matchesSearch, subscriptionFor } from "@/lib/utils/customers";
import { useAdminUsers } from "@/lib/hooks/use-admin-users";
import { useAdminSubscriptions } from "@/lib/hooks/use-admin";
import { useCurrentUser } from "@/lib/hooks/use-account";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import type { AccountUser, Column, Subscription } from "@/lib/types";

const columnsFor = (
    subscriptions: Subscription[],
    selfId: string | undefined,
): Column<AccountUser>[] => [
    {
        key: "customer",
        header: "Customer",
        render: (row) => (
            <span className="flex flex-col">
                <span className="text-text font-medium">{row.fullName}</span>
                <span className="text-text-secondary text-xs">{row.email}</span>
            </span>
        ),
    },
    { key: "role", header: "Role", render: (row) => titleCase(row.role) },
    {
        key: "account",
        header: "Account",
        render: (row) => <StatusPill status={row.status} />,
    },
    {
        key: "plan",
        header: "Plan",
        render: (row) =>
            subscriptionFor(row.id, subscriptions)?.plan?.name ?? EMPTY_VALUE,
    },
    {
        key: "subscription",
        header: "Subscription",
        render: (row) => {
            const current = subscriptionFor(row.id, subscriptions);

            return current ? (
                <StatusPill status={current.status} />
            ) : (
                EMPTY_VALUE
            );
        },
    },
    {
        key: "active",
        header: "Last active",
        render: (row) => formatDate(row.lastActive),
    },
    {
        key: "access",
        header: "Access",
        render: (row) => (
            <AccountStatusButton user={row} isSelf={row.id === selfId} />
        ),
    },
];

export default function AdminUserList() {
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState<string | undefined>(undefined);
    const users = useAdminUsers();
    const subscriptions = useAdminSubscriptions("ALL");
    const self = useCurrentUser();

    const rows = (users.data ?? []).filter(
        (user) =>
            matchesSearch(user, debouncedSearch) &&
            (status === undefined || user.status === status),
    );

    return (
        <SectionCard
            title="Customers"
            description="Find an account by name or email, see where it stands, and suspend or restore access."
            bodyless
        >
            <div className="list-toolbar">
                <FormField
                    label="Search"
                    type="search"
                    value={search}
                    onChange={setSearch}
                    placeholder="Name or email"
                />
                <SelectInput
                    label="Account status"
                    data={ACCOUNT_STATUS_OPTIONS}
                    value={status}
                    handleChange={setStatus}
                />
            </div>

            {subscriptions.isError && (
                <p role="status" className="text-warning p-3 text-xs">
                    Plan and subscription details could not be loaded.
                </p>
            )}

            {users.isPending && <Skeleton lines={5} className="p-3" />}

            {users.isError && (
                <ErrorState
                    error={users.error}
                    onRetry={() => void users.refetch()}
                />
            )}

            {!users.isPending && !users.isError && rows.length === 0 && (
                <EmptyState
                    icon={UserSearch}
                    title="No accounts match"
                    description="Clear the search or the status filter to see every account."
                />
            )}

            {rows.length > 0 && (
                <DataTable
                    columns={columnsFor(
                        subscriptions.data ?? [],
                        self.data?.id,
                    )}
                    rows={rows}
                    rowKey={(row) => row.id}
                />
            )}
        </SectionCard>
    );
}
