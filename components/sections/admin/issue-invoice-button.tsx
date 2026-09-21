"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { ApiError } from "@/lib/errors/api-error";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/constants";
import { useIssueInvoice } from "@/lib/hooks/use-cycle";

interface Props {
    subscriptionId: string;
}

const labelFor = (isError: boolean, isSuccess: boolean): string => {
    if (isError) return "Retry";
    if (isSuccess) return "Issued";

    return "Issue invoice";
};

export default function IssueInvoiceButton({ subscriptionId }: Props) {
    const [confirming, setConfirming] = useState(false);
    const issue = useIssueInvoice();
    const reason =
        issue.error instanceof ApiError
            ? issue.error.message
            : FALLBACK_ERROR_MESSAGE;

    const confirm = () => {
        issue.mutate(subscriptionId);
        setConfirming(false);
    };

    return (
        <>
            <Button
                size="sm"
                tone={issue.isError ? "danger" : "quiet"}
                isLoading={issue.isPending}
                disabled={issue.isSuccess}
                title={issue.isError ? reason : undefined}
                onClick={() => setConfirming(true)}
            >
                {labelFor(issue.isError, issue.isSuccess)}
            </Button>

            <ConfirmDialog
                open={confirming}
                title="Issue this period's invoice?"
                description="Creates the invoice for this subscription's current billing period. Issuing the same period twice produces exactly one invoice, so this is safe to retry."
                confirmLabel="Issue invoice"
                isPending={issue.isPending}
                onConfirm={confirm}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
