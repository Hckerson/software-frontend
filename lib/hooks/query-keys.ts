import type { SubscriptionStatus, UsageMetricType } from "@/lib/types";

export const queryKeys = {
    currentUser: ["users", "me"] as const,
    users: ["users"] as const,
    plans: ["plans"] as const,
    plan: (id: string) => ["plans", id] as const,
    subscription: ["subscriptions", "current"] as const,
    subscriptionHistory: ["subscriptions", "history"] as const,
    invoices: ["invoices"] as const,
    invoice: (id: string) => ["invoices", id] as const,
    upcomingInvoice: ["invoices", "upcoming"] as const,
    usageCurrent: ["usage", "current"] as const,
    usageHistory: ["usage", "history"] as const,
    usageLimits: ["usage", "limits"] as const,
    paymentMethods: ["payment-methods"] as const,
    usageLimit: (metric: UsageMetricType) =>
        ["usage", "limit", metric] as const,
    admin: ["admin"] as const,
    adminStats: ["admin", "stats"] as const,
    billingStats: ["admin", "billing", "stats"] as const,
    invoiceStats: ["admin", "billing", "invoice-stats"] as const,
    overdueInvoices: ["admin", "billing", "overdue"] as const,
    adminSubscriptions: (status: SubscriptionStatus | "ALL") =>
        ["admin", "billing", "subscriptions", status] as const,
};

export const billingKeys = [
    queryKeys.subscription,
    queryKeys.subscriptionHistory,
    queryKeys.invoices,
    queryKeys.upcomingInvoice,
    queryKeys.usageCurrent,
];
