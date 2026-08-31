import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type StatTone = "pipeline" | "success" | "activity" | "warning";

interface Props {
    label: string;
    value: string;
    meta?: string;
    icon?: LucideIcon;
    tone?: StatTone;
}

const TONE_CLASS: Record<StatTone, string> = {
    pipeline: "stat-card--pipeline",
    success: "stat-card--success",
    activity: "stat-card--activity",
    warning: "stat-card--warning",
};

export default function StatCard({
    label,
    value,
    meta,
    icon: Icon,
    tone = "pipeline",
}: Props) {
    return (
        <article className={clsx("stat-card", TONE_CLASS[tone])}>
            {Icon && (
                <span className="metric-icon">
                    <Icon strokeWidth={1.5} />
                </span>
            )}
            <p className="metric-label">{label}</p>
            <p className="metric-value">{value}</p>
            {meta && <p className="metric-meta">{meta}</p>}
        </article>
    );
}
