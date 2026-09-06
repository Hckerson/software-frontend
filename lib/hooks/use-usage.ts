import { useQuery } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type {
    MetricUsage,
    UsageLimitCheck,
    UsageLog,
    UsageMetricType,
} from "@/lib/types";

export const useCurrentUsage = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.usageCurrent,
        queryFn: () => query.get<MetricUsage[]>(routes.usageGetCurrentUsage()),
        enabled,
        retry: false,
    });

export const useUsageHistory = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.usageHistory,
        queryFn: () => query.get<UsageLog[]>(routes.usageGetUsageHistory()),
        enabled,
        retry: false,
    });

export const useUsageLimits = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.usageLimits,
        queryFn: () =>
            query.get<UsageLimitCheck[]>(routes.usageCheckAllLimits()),
        enabled,
        retry: false,
    });

export const useUsageLimit = (metric: UsageMetricType, enabled = true) =>
    useQuery({
        queryKey: queryKeys.usageLimit(metric),
        queryFn: () =>
            query.get<UsageLimitCheck>(routes.usageCheckLimit(metric)),
        enabled,
        retry: false,
    });
