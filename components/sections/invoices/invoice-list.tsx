"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import SelectInput from "@/components/ui/forms/select-input";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import InvoiceTable from "@/components/sections/invoices/invoice-table";
import { INVOICE_STATUS_OPTIONS } from "@/lib/data/status-options";
import { useInvoices } from "@/lib/hooks/use-invoices";

export default function InvoiceList() {
    const { data, isPending, isError, error, refetch } = useInvoices();
    const [status, setStatus] = useState<string | undefined>(undefined);

    const rows = (data ?? []).filter(
        (invoice) => !status || invoice.status === status,
    );

    return (
        <SectionCard
            title="Invoices"
            action={
                <div className="w-40">
                    <SelectInput
                        label="Status"
                        data={INVOICE_STATUS_OPTIONS}
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
                    icon={FileText}
                    title={
                        status
                            ? "No invoices with that status"
                            : "No invoices yet"
                    }
                    description={
                        status
                            ? "Clear the filter to see every invoice."
                            : "Your first invoice appears at the end of the current billing period."
                    }
                />
            )}

            {rows.length > 0 && <InvoiceTable invoices={rows} />}
        </SectionCard>
    );
}
