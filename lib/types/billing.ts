import type {
    BillingStatsDto,
    CycleRunAllDto,
    CycleRunSummaryDto,
    InvoiceDto,
    InvoiceStatsDto,
    LimitCheckDto,
    MetricUsageDto,
    PaymentMethodDto,
    SubscriptionDto,
    SubscriptionPlanDto,
    UpcomingInvoiceDto,
    UsageLogDto,
} from "@/lib/contract/schemas";

export type SubscriptionPlan = SubscriptionPlanDto;
export type Subscription = SubscriptionDto;
export type Invoice = InvoiceDto;
export type UpcomingInvoice = UpcomingInvoiceDto;
export type UsageLog = UsageLogDto;
export type MetricUsage = MetricUsageDto;
export type UsageLimitCheck = LimitCheckDto;
export type BillingStats = BillingStatsDto;
export type InvoiceStats = InvoiceStatsDto;
export type PaymentMethod = PaymentMethodDto;
export type CycleRunSummary = CycleRunSummaryDto;
export type CycleRunAll = CycleRunAllDto;

export type PlanType = SubscriptionPlanDto["planType"];
export type SubscriptionStatus = SubscriptionDto["status"];
export type InvoiceStatus = InvoiceDto["status"];
export type UsageMetricType = UsageLogDto["metricType"];

export type PlanLimits = SubscriptionPlanDto["limits"];
