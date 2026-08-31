import { USAGE_THRESHOLD } from "@/lib/constants";
import type { MeterState, MetricUsage, UsageMetricType } from "@/lib/types";

const isMetricUsage = (value: unknown): value is MetricUsage => {
    if (typeof value !== "object" || value === null) return false;

    const record = value as Record<string, unknown>;

    return (
        typeof record.metricType === "string" &&
        typeof record.amount === "number" &&
        typeof record.period === "string"
    );
};

export const normalizeCurrentUsage = (payload: unknown): MetricUsage[] => {
    if (Array.isArray(payload)) return payload.filter(isMetricUsage);

    return isMetricUsage(payload) ? [payload] : [];
};

export const usageFor = (
    usage: MetricUsage[],
    metricType: UsageMetricType,
): number =>
    usage.find((entry) => entry.metricType === metricType)?.amount ?? 0;

export const usageRatio = (consumed: number, limit: number): number =>
    limit > 0 ? (consumed / limit) * 100 : 0;

export const meterState = (percentage: number): MeterState => {
    if (percentage >= USAGE_THRESHOLD.exceeded) return "exceeded";
    if (percentage >= USAGE_THRESHOLD.warning) return "warning";

    return "normal";
};
