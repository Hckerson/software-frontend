"use client";
import { FileText } from "lucide-react";
import SectionCard from "@/components/common/section-card";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import LinkButton from "@/components/common/link-button";
import InvoiceTable from "@/components/sections/invoices/invoice-table";
import { useInvoices } from "@/lib/hooks/use-invoices";

const RECENT_COUNT = 5;

export default function RecentInvoices() {
    const { data, isPending, isError, error, refetch } = useInvoices();
    const recent = (data ?? []).slice(0, RECENT_COUNT);

    return (
        <SectionCard
            title="Recent invoices"
            action={
                <LinkButton href="/invoices" tone="quiet" size="sm">
                    View all
                </LinkButton>
            }
            bodyless={recent.length > 0}
        >
            {isPending && <Skeleton lines={4} className="p-3" />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && recent.length === 0 && (
                <EmptyState
                    icon={FileText}
                    title="No invoices yet"
                    description="Your first invoice appears at the end of the current billing period."
                />
            )}

            {recent.length > 0 && <InvoiceTable invoices={recent} />}
        </SectionCard>
    );
}
