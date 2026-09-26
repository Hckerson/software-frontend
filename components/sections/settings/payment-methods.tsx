"use client";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import Button from "@/components/common/button";
import SectionCard from "@/components/common/section-card";
import Skeleton from "@/components/common/skeleton";
import EmptyState from "@/components/common/empty-state";
import ErrorState from "@/components/common/error-state";
import ConfirmDialog from "@/components/common/confirm-dialog";
import PaymentMethodRow from "@/components/sections/settings/payment-method-row";
import {
    usePaymentMethods,
    useRemovePaymentMethod,
    useSetDefaultPaymentMethod,
} from "@/lib/hooks/use-payment-methods";
import type { PaymentMethod } from "@/lib/types";

export default function PaymentMethods() {
    const { data, isPending, isError, error, refetch } = usePaymentMethods();
    const setDefault = useSetDefaultPaymentMethod();
    const remove = useRemovePaymentMethod();
    const [pending, setPending] = useState<PaymentMethod | null>(null);
    const methods = data ?? [];

    return (
        <SectionCard
            title="Payment methods"
            description="The default card is charged when an invoice is issued."
        >
            {isPending && <Skeleton lines={3} />}

            {isError && (
                <ErrorState error={error} onRetry={() => void refetch()} />
            )}

            {!isPending && !isError && methods.length === 0 && (
                <EmptyState
                    icon={CreditCard}
                    title="No payment method"
                    description="Add a card so invoices can be settled automatically."
                />
            )}

            {methods.map((method) => (
                <PaymentMethodRow
                    key={method.id}
                    method={method}
                    isBusy={setDefault.isPending || remove.isPending}
                    onMakeDefault={() => setDefault.mutate(method.id)}
                    onRemove={() => setPending(method)}
                />
            ))}

            {(setDefault.isError || remove.isError) && (
                <ErrorState error={setDefault.error ?? remove.error} />
            )}

            <ConfirmDialog
                open={Boolean(pending)}
                title="Remove this card"
                description={`Card ending ${pending?.last4Digits ?? ""} will be removed. If it is your default, the next most recent card becomes default.`}
                confirmLabel="Remove card"
                isPending={remove.isPending}
                onConfirm={() =>
                    pending &&
                    remove.mutate(pending.id, {
                        onSuccess: () => setPending(null),
                    })
                }
                onCancel={() => setPending(null)}
            />

            <Button
                tone="quiet"
                size="sm"
                onClick={() => void refetch()}
                className="self-start"
            >
                Refresh
            </Button>
        </SectionCard>
    );
}
