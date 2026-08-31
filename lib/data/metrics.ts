import { Activity, HardDrive, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UsageMetricType } from "@/lib/types";

export interface MetricDescriptor {
    metricType: UsageMetricType;
    label: string;
    unit: string;
    icon: LucideIcon;
}

export const METRIC_DESCRIPTORS: MetricDescriptor[] = [
    {
        metricType: "API_CALLS",
        label: "API calls",
        unit: "calls",
        icon: Activity,
    },
    {
        metricType: "STORAGE_GB",
        label: "Storage",
        unit: "GB",
        icon: HardDrive,
    },
    { metricType: "SEATS", label: "Seats", unit: "seats", icon: Users },
];
