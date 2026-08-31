import { useQuery } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type {
    AdminStats,
    BillingStats,
    Invoice,
    InvoiceStats,
    Subscription,
    SubscriptionStatus,
} from "@/lib/types";

export const useAdminStats = () =>
    useQuery({
        queryKey: queryKeys.adminStats,
        queryFn: () => query.get<AdminStats>(routes.adminGetStats()),
    });

export const useBillingStats = () =>
    useQuery({
        queryKey: queryKeys.billingStats,
        queryFn: () => query.get<BillingStats>(routes.billingGetBillingStats()),
    });

export const useInvoiceStats = () =>
    useQuery({
        queryKey: queryKeys.invoiceStats,
        queryFn: () => query.get<InvoiceStats>(routes.billingGetInvoiceStats()),
    });

export const useOverdueInvoices = () =>
    useQuery({
        queryKey: queryKeys.overdueInvoices,
        queryFn: () => query.get<Invoice[]>(routes.billingGetOverdueInvoices()),
    });

export const useAdminSubscriptions = (status: SubscriptionStatus | "ALL") =>
    useQuery({
        queryKey: queryKeys.adminSubscriptions(status),
        queryFn: () =>
            query.get<Subscription[]>(
                status === "ALL"
                    ? routes.billingGetAllSubscriptions()
                    : routes.billingGetSubscriptionsByStatus(status),
            ),
    });
