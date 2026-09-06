import { USAGE_THRESHOLD } from "@/lib/constants";
import type {
    MeterState,
    MetricUsage,
    PlanLimits,
    UsageMetricType,
} from "@/lib/types";

export const limitFor = (
    limits: PlanLimits | undefined,
    metricType: UsageMetricType,
): number | null => {
    const value = limits?.[metricType];

    return typeof value === "number" && value > 0 ? value : null;
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
