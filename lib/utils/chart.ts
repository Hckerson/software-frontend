import type { TrendPoint, UsageLog, UsageMetricType } from "@/lib/types";

export const CHART = {
    width: 320,
    height: 168,
    left: 40,
    right: 8,
    top: 20,
    bottom: 22,
} as const;

export const PLOT_HEIGHT = CHART.height - CHART.top - CHART.bottom;

export const BASELINE = CHART.top + PLOT_HEIGHT;

const NICE = [1, 2, 5, 10];
const TARGET_INTERVALS = 5;
const MAX_PERIODS = 12;
const BAR_CAP = 24;
const BAR_SHARE = 0.6;

export const niceStep = (raw: number): number => {
    if (!Number.isFinite(raw) || raw <= 1) return 1;

    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const multiple = NICE.find((candidate) => candidate * magnitude >= raw);

    return (multiple ?? 10) * magnitude;
};

export const axisFor = (max: number): { ceiling: number; ticks: number[] } => {
    const step = niceStep(max / TARGET_INTERVALS);
    const ceiling = Math.max(step, Math.ceil(max / step) * step);
    const count = Math.round(ceiling / step);

    return {
        ceiling,
        ticks: Array.from({ length: count + 1 }, (_, index) => index * step),
    };
};

export const seriesFor = (
    logs: UsageLog[],
    metricType: UsageMetricType,
): TrendPoint[] => {
    const totals = new Map<string, number>();

    for (const log of logs) {
        if (log.metricType !== metricType) continue;

        totals.set(log.period, (totals.get(log.period) ?? 0) + log.amount);
    }

    return [...totals.entries()]
        .map(([period, amount]) => ({ period, amount }))
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-MAX_PERIODS);
};

export const barWidthFor = (band: number): number =>
    Math.max(2, Math.min(BAR_CAP, band * BAR_SHARE));

export const columnPath = (
    x: number,
    top: number,
    width: number,
    baseline: number,
    radius = 4,
): string => {
    const height = baseline - top;

    if (height <= 0) return "";

    const r = Math.min(radius, width / 2, height);

    return [
        `M ${x} ${baseline}`,
        `V ${top + r}`,
        `Q ${x} ${top} ${x + r} ${top}`,
        `H ${x + width - r}`,
        `Q ${x + width} ${top} ${x + width} ${top + r}`,
        `V ${baseline}`,
        "Z",
    ].join(" ");
};

export const yScale =
    (ceiling: number) =>
    (value: number): number =>
        BASELINE - (value / ceiling) * PLOT_HEIGHT;
