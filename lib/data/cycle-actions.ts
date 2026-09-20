export type CycleActionKey = "run" | "renew" | "sweep";

export interface CycleActionCopy {
    key: CycleActionKey;
    label: string;
    title: string;
    description: string;
    confirmLabel: string;
}

export const CYCLE_ACTIONS: CycleActionCopy[] = [
    {
        key: "run",
        label: "Run full cycle",
        title: "Run the full billing cycle?",
        description:
            "Renews every subscription past its period end, issues the closing invoice for each, then marks sent invoices past their due date as overdue. Every job is idempotent, so a second run changes nothing.",
        confirmLabel: "Run cycle",
    },
    {
        key: "renew",
        label: "Renew due only",
        title: "Renew subscriptions past their period end?",
        description:
            "Issues the closing invoice, rolls the billing period forward and advances the renewal date. Subscriptions inside their current period are skipped.",
        confirmLabel: "Renew",
    },
    {
        key: "sweep",
        label: "Sweep overdue only",
        title: "Mark past-due invoices overdue?",
        description:
            "Moves sent invoices past their due date to overdue and the owning subscription to past due. Nothing is charged and nothing is sent.",
        confirmLabel: "Sweep",
    },
];
