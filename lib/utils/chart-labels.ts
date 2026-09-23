import { dateFormatter } from "@/lib/utils/date-formatter";
import { formatCount } from "@/lib/utils/format";
import { CHART } from "@/lib/utils/chart";
import type { LabelSide, TrendPoint } from "@/lib/types";

const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export const formatCompact = (value: number): string =>
    compactFormatter.format(value);

export const formatPeriodLabel = (period: string, withYear = false): string =>
    dateFormatter(`${period}-01T00:00:00`, withYear ? "MMM yyyy" : "MMM");

export const describePoint = (
    point: TrendPoint,
    unit: string,
    limit: number | null,
): string => {
    const share =
        limit === null
            ? ""
            : `, ${Math.round((point.amount / limit) * 100)}% of the limit`;

    return `${formatPeriodLabel(point.period, true)}: ${formatCount(point.amount)} ${unit}${share}`;
};

const LABEL_EVERY = 6;

export const periodLabels = (
    points: TrendPoint[],
    centre: (index: number) => number,
): { key: string; x: number; text: string }[] => {
    const step = Math.ceil(points.length / LABEL_EVERY);
    const last = points.length - 1;

    return points.flatMap((point, index) =>
        index % step === 0 || index === last
            ? [
                  {
                      key: point.period,
                      x: centre(index),
                      text: formatPeriodLabel(point.period),
                  },
              ]
            : [],
    );
};

const LIMIT_LABEL_WIDTH = 64;
const LIMIT_LABEL_CLEARANCE = 26;

export const limitLabelSide = (
    points: TrendPoint[],
    centre: (index: number) => number,
    y: (value: number) => number,
    limit: number,
): LabelSide => {
    const floor = y(limit) + LIMIT_LABEL_CLEARANCE;
    const clearOver = (from: number, to: number) =>
        points.every(
            (point, index) =>
                centre(index) < from ||
                centre(index) > to ||
                y(point.amount) >= floor,
        );
    const right = CHART.width - CHART.right;

    if (clearOver(right - LIMIT_LABEL_WIDTH, right)) return "end";
    if (clearOver(CHART.left, CHART.left + LIMIT_LABEL_WIDTH)) return "start";

    return null;
};
