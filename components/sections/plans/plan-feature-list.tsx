import { Check } from "lucide-react";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import { formatCount, formatRate, titleCase } from "@/lib/utils/format";
import { limitFor, overageRateFor } from "@/lib/utils/usage";
import type { OverageRates, PlanLimits, UsageMetricType } from "@/lib/types";

interface Props {
    limits: PlanLimits;
    overageRates: OverageRates;
    features: Record<string, unknown>;
}

const describe = (value: unknown): string =>
    typeof value === "boolean" ? "" : ` — ${String(value)}`;

const describeLimit = (
    limits: PlanLimits,
    overageRates: OverageRates,
    descriptor: { metricType: UsageMetricType; unit: string },
): string => {
    const limit = limitFor(limits, descriptor.metricType);

    if (limit === null) return `Unlimited ${descriptor.unit}`;

    const rate = overageRateFor(overageRates, descriptor.metricType);
    const included = `${formatCount(limit)} ${descriptor.unit}`;

    return rate === null
        ? included
        : `${included}, then ${formatRate(rate)} each`;
};

export default function PlanFeatureList({
    limits,
    overageRates,
    features,
}: Props) {
    const included = Object.entries(features).filter(([, value]) =>
        Boolean(value),
    );

    return (
        <ul className="flex flex-col gap-2">
            {METRIC_DESCRIPTORS.map((descriptor) => (
                <li
                    key={descriptor.metricType}
                    className="text-text-secondary flex items-center gap-2 text-xs"
                >
                    <descriptor.icon
                        className="text-text-muted size-3 shrink-0"
                        strokeWidth={1.5}
                    />
                    <span>
                        {describeLimit(limits, overageRates, descriptor)}
                    </span>
                </li>
            ))}
            {included.map(([name, value]) => (
                <li
                    key={name}
                    className="text-text-secondary flex items-center gap-2 text-xs"
                >
                    <Check
                        className="text-success size-3 shrink-0"
                        strokeWidth={1.5}
                    />
                    <span>{`${titleCase(name)}${describe(value)}`}</span>
                </li>
            ))}
        </ul>
    );
}
