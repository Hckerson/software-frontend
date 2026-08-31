import UsageMeter from "@/components/common/usage-meter";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import { usageFor } from "@/lib/utils/usage";
import type { MetricUsage, PlanLimits } from "@/lib/types";

interface Props {
    limits: PlanLimits;
    usage: MetricUsage[];
}

export default function MeterRow({ limits, usage }: Props) {
    return (
        <div className="meter-grid">
            {METRIC_DESCRIPTORS.map((descriptor) => (
                <UsageMeter
                    key={descriptor.metricType}
                    label={descriptor.label}
                    unit={descriptor.unit}
                    icon={descriptor.icon}
                    consumed={usageFor(usage, descriptor.metricType)}
                    limit={limits[descriptor.metricType] ?? null}
                />
            ))}
        </div>
    );
}
