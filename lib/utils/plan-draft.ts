import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import type { OverageRates, PlanLimits } from "@/lib/types";

const collect = (
    draft: Record<string, string>,
    parse: (raw: string) => number,
): Record<string, number> => {
    const collected: Record<string, number> = {};

    for (const descriptor of METRIC_DESCRIPTORS) {
        const value = parse(draft[descriptor.metricType] ?? "");

        if (Number.isFinite(value) && value > 0) {
            collected[descriptor.metricType] = value;
        }
    }

    return collected;
};

export const toLimits = (draft: Record<string, string>): PlanLimits =>
    collect(draft, (raw) => Number.parseInt(raw, 10));

export const toOverageRates = (draft: Record<string, string>): OverageRates =>
    collect(draft, (raw) => Number.parseFloat(raw));

export const toDraft = (
    values: PlanLimits | OverageRates | undefined,
): Record<string, string> => {
    const draft: Record<string, string> = {};

    for (const descriptor of METRIC_DESCRIPTORS) {
        const value = values?.[descriptor.metricType];

        if (typeof value === "number" && value > 0) {
            draft[descriptor.metricType] = String(value);
        }
    }

    return draft;
};
