import { Check } from "lucide-react";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import { formatCount, titleCase } from "@/lib/utils/format";
import type { PlanLimits } from "@/lib/types";

interface Props {
    limits: PlanLimits;
    features: Record<string, unknown>;
}

const describe = (value: unknown): string =>
    typeof value === "boolean" ? "" : ` — ${String(value)}`;

export default function PlanFeatureList({ limits, features }: Props) {
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
                        {limits[descriptor.metricType]
                            ? `${formatCount(limits[descriptor.metricType])} ${descriptor.unit}`
                            : `Unlimited ${descriptor.unit}`}
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
