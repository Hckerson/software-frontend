"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { ApiError } from "@/lib/errors/api-error";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/constants";
import { useSetAccountStatus } from "@/lib/hooks/use-admin-users";
import type { AccountUser } from "@/lib/types";

interface Props {
    user: AccountUser;
    isSelf: boolean;
}

export default function AccountStatusButton({ user, isSelf }: Props) {
    const [confirming, setConfirming] = useState(false);
    const change = useSetAccountStatus();
    const suspended = user.status === "SUSPENDED";
    const reason =
        change.error instanceof ApiError
            ? change.error.message
            : FALLBACK_ERROR_MESSAGE;

    if (isSelf) {
        return <span className="text-text-muted text-xs">You</span>;
    }

    const confirm = () => {
        change.mutate({
            id: user.id,
            status: suspended ? "ACTIVE" : "SUSPENDED",
        });
        setConfirming(false);
    };

    return (
        <>
            <Button
                size="sm"
                tone={change.isError ? "danger" : "quiet"}
                isLoading={change.isPending}
                title={change.isError ? reason : undefined}
                onClick={() => setConfirming(true)}
            >
                {suspended ? "Reactivate" : "Suspend"}
            </Button>

            <ConfirmDialog
                open={confirming}
                title={
                    suspended
                        ? `Reactivate ${user.fullName}?`
                        : `Suspend ${user.fullName}?`
                }
                description={
                    suspended
                        ? "They can sign in again straight away. Their subscription and invoices were never touched."
                        : "They are signed out on their next request and cannot sign back in. Their subscription, invoices and history are kept, and reactivating restores access."
                }
                confirmLabel={suspended ? "Reactivate" : "Suspend"}
                isPending={change.isPending}
                onConfirm={confirm}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
