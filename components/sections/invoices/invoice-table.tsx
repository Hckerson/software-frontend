"use client";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/data-table";
import Money from "@/components/common/money";
import PeriodRange from "@/components/common/period-range";
import StatusPill from "@/components/common/status-pill";
import { formatDate } from "@/lib/utils/format";
import type { Column, Invoice } from "@/lib/types";

const columns: Column<Invoice>[] = [
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
    {
        key: "due",
        header: "Due",
        render: (row) => formatDate(row.dueDate),
    },
    {
        key: "status",
        header: "Status",
        render: (row) => <StatusPill status={row.status} />,
    },
];

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
    const router = useRouter();

    return (
        <DataTable
            columns={columns}
            rows={invoices}
            rowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/invoices/${row.id}`)}
        />
    );
}
