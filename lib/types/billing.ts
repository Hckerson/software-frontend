import type { AccountUser } from "@/lib/types/account";

export type PlanType = "FREE" | "PRO" | "ENTERPRISE";

export type SubscriptionStatus =
    "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "FAILED" | "OVERDUE";

export type UsageMetricType = "API_CALLS" | "STORAGE_GB" | "SEATS";

export type PlanLimits = Partial<Record<UsageMetricType, number>>;

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    priceUSD: string;
    planType: PlanType;
    features: Record<string, unknown>;
    limits: PlanLimits;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    startDate: string;
    renewalDate: string;
    canceledAt: string | null;
    currentBillingPeriodStart: string;
    currentBillingPeriodEnd: string;
    status: SubscriptionStatus;
    plan?: SubscriptionPlan;
    user?: AccountUser;
}

export interface Invoice {
    id: string;
    subscriptionId: string;
    userId: string;
    amount: string;
    stripeInvoiceId: string | null;
    paidDate: string | null;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate: string;
    status: InvoiceStatus;
}

export interface UsageLog {
    id: string;
    subscriptionId: string;
    amount: number;
    period: string;
    metricType: UsageMetricType;
    createdAt: string;
    updatedAt: string;
}

export interface UsageLimitCheck {
    isAllowed: boolean;
    remainingQuota: number;
    percentageUsed: number;
}

export interface MetricUsage {
    metricType: UsageMetricType;
    amount: number;
    period: string;
}

export interface BillingStats {
    activeSubscriptions: number;
    totalSubscriptions: number;
    churnRate: string;
    paidInvoices: number;
    overdueInvoices: number;
    timestamp: string;
}

export interface InvoiceStats {
    total: number;
    paid: number;
    overdue: number;
    draft: number;
    paidPercentage: string;
}
