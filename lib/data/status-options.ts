import { titleCase } from "@/lib/utils/format";
import type { InvoiceStatus, SubscriptionStatus } from "@/lib/types";

export interface StatusOption {
    label: string;
    value: string | undefined;
}

const INVOICE_STATUSES: InvoiceStatus[] = [
    "DRAFT",
    "SENT",
    "PAID",
    "FAILED",
    "OVERDUE",
];

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
    "ACTIVE",
    "PAST_DUE",
    "SUSPENDED",
    "CANCELED",
];

const toOption = (value: string): StatusOption => ({
    label: titleCase(value),
    value,
});

export const INVOICE_STATUS_OPTIONS: StatusOption[] =
    INVOICE_STATUSES.map(toOption);

export const SUBSCRIPTION_STATUS_OPTIONS: StatusOption[] =
    SUBSCRIPTION_STATUSES.map(toOption);
