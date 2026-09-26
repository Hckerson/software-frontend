import { CreditCard } from "lucide-react";
import Button from "@/components/common/button";
import type { PaymentMethod } from "@/lib/types";

interface Props {
    method: PaymentMethod;
    isBusy: boolean;
    onMakeDefault: () => void;
    onRemove: () => void;
}

const pad = (value: number): string => String(value).padStart(2, "0");

export default function PaymentMethodRow({
    method,
    isBusy,
    onMakeDefault,
    onRemove,
}: Props) {
    return (
        <div className="border-border-light flex flex-wrap items-center justify-between gap-3 border-b py-2 last:border-b-0">
            <div className="flex items-center gap-3">
                <CreditCard
                    className="text-text-muted size-4 shrink-0"
                    strokeWidth={1.5}
                />
                <div className="flex flex-col">
                    <span className="text-text font-mono text-sm">
                        {`•••• ${method.last4Digits}`}
                    </span>
                    <span className="text-text-muted text-xs">
                        {`Expires ${pad(method.expiryMonth)}/${method.expiryYear}`}
                    </span>
                </div>
                {method.isDefault && (
                    <span className="status-pill status-pill--success">
                        Default
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!method.isDefault && (
                    <Button
                        size="sm"
                        tone="quiet"
                        disabled={isBusy}
                        onClick={onMakeDefault}
                    >
                        Make default
                    </Button>
                )}
                <Button
                    size="sm"
                    tone="ghost"
                    disabled={isBusy}
                    onClick={onRemove}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
}
