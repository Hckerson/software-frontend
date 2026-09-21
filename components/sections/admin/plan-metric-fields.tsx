"use client";
import FormField from "@/components/common/form-field";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";

interface Props {
    limits: Record<string, string>;
    rates: Record<string, string>;
    onLimitChange: (metricType: string, value: string) => void;
    onRateChange: (metricType: string, value: string) => void;
}

export default function PlanMetricFields({
    limits,
    rates,
    onLimitChange,
    onRateChange,
}: Props) {
    return (
        <div className="form-grid">
            {METRIC_DESCRIPTORS.map((descriptor) => (
                <FormField
                    key={`${descriptor.metricType}-limit`}
                    label={`${descriptor.label} limit`}
                    type="number"
                    value={limits[descriptor.metricType] ?? ""}
                    onChange={(value) =>
                        onLimitChange(descriptor.metricType, value)
                    }
                />
            ))}
            {METRIC_DESCRIPTORS.map((descriptor) => (
                <FormField
                    key={`${descriptor.metricType}-rate`}
                    label={`${descriptor.label} overage rate`}
                    type="number"
                    value={rates[descriptor.metricType] ?? ""}
                    onChange={(value) =>
                        onRateChange(descriptor.metricType, value)
                    }
                />
            ))}
        </div>
    );
}
