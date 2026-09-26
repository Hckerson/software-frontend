import type { LucideIcon } from "lucide-react";
import { formatCount } from "@/lib/utils/format";
import { meterState, usageRatio } from "@/lib/utils/usage";

interface Props {
    label: string;
    unit: string;
    consumed: number;
    limit: number | null;
    icon?: LucideIcon;
}

const UNLIMITED = "No limit on this plan";
const FULL = 100;

export default function UsageMeter({
    label,
    unit,
    consumed,
    limit,
    icon: Icon,
}: Props) {
    const hasLimit = typeof limit === "number" && limit > 0;
    const percentage = hasLimit ? usageRatio(consumed, limit) : 0;
    const state = hasLimit ? meterState(percentage) : "normal";
    const width = Math.min(percentage, FULL);

    return (
        <article className="usage-meter" data-state={state}>
            <header className="flex items-center gap-2">
                {Icon && (
                    <Icon
                        className="text-text-muted size-4 shrink-0"
                        strokeWidth={1.5}
                    />
                )}
                <span className="micro-label text-text-secondary">{label}</span>
            </header>

            <p className="usage-meter-value">
                {formatCount(consumed)}
                <span className="text-text-muted text-sm">
                    {hasLimit ? ` / ${formatCount(limit)} ${unit}` : ` ${unit}`}
                </span>
            </p>

            <div
                className="usage-meter-track"
                role="progressbar"
                aria-label={label}
                aria-valuenow={Math.round(width)}
                aria-valuemin={0}
                aria-valuemax={FULL}
            >
                <div
                    className="usage-meter-fill"
                    style={{ width: `${width}%` }}
                />
            </div>

            <p className="text-text-secondary text-xs">
                {hasLimit
                    ? `${percentage.toFixed(0)}% of your monthly allowance used`
                    : UNLIMITED}
            </p>
        </article>
    );
}
