import { describe, expect, it } from "vitest";
import {
    BASELINE,
    axisFor,
    barWidthFor,
    columnPath,
    niceStep,
    seriesFor,
    yScale,
} from "@/lib/utils/chart";
import {
    describePoint,
    formatCompact,
    limitLabelSide,
    periodLabels,
} from "@/lib/utils/chart-labels";
import type { UsageLog } from "@/lib/types";

const log = (
    metricType: UsageLog["metricType"],
    period: string,
    amount: number,
): UsageLog =>
    ({ id: `${metricType}-${period}`, metricType, period, amount }) as UsageLog;

describe("axisFor", () => {
    it("rounds up to a clean ceiling with clean steps", () => {
        expect(axisFor(412500)).toEqual({
            ceiling: 500000,
            ticks: [0, 100000, 200000, 300000, 400000, 500000],
        });
    });

    it("uses the full height rather than jumping to the next power of ten", () => {
        expect(axisFor(600000).ceiling).toBe(600000);
    });

    it("never produces a fractional tick, since every metric is a whole number", () => {
        for (const max of [1, 3, 7, 10, 78]) {
            expect(axisFor(max).ticks.every(Number.isInteger)).toBe(true);
        }
    });

    it("still draws an axis when nothing has been used", () => {
        expect(axisFor(0)).toEqual({ ceiling: 1, ticks: [0, 1] });
    });
});

describe("niceStep", () => {
    it("picks from the 1, 2, 5 series", () => {
        expect(niceStep(120000)).toBe(200000);
        expect(niceStep(16)).toBe(20);
        expect(niceStep(2)).toBe(2);
    });
});

describe("seriesFor", () => {
    it("keeps one metric, in period order", () => {
        const logs = [
            log("API_CALLS", "2026-09", 3),
            log("SEATS", "2026-08", 9),
            log("API_CALLS", "2026-07", 1),
        ];

        expect(seriesFor(logs, "API_CALLS")).toEqual([
            { period: "2026-07", amount: 1 },
            { period: "2026-09", amount: 3 },
        ]);
    });

    it("adds rows that share a period rather than plotting them twice", () => {
        const logs = [
            log("SEATS", "2026-09", 4),
            { ...log("SEATS", "2026-09", 3), id: "second" },
        ];

        expect(seriesFor(logs, "SEATS")).toEqual([
            { period: "2026-09", amount: 7 },
        ]);
    });

    it("shows at most the last twelve periods", () => {
        const logs = Array.from({ length: 15 }, (_, index) =>
            log("SEATS", `2025-${String(index + 1).padStart(2, "0")}`, index),
        );

        const series = seriesFor(logs, "SEATS");

        expect(series).toHaveLength(12);
        expect(series[0].amount).toBe(3);
    });
});

describe("marks", () => {
    it("caps a column at 24 units however wide its band", () => {
        expect(barWidthFor(200)).toBe(24);
        expect(barWidthFor(20)).toBe(12);
    });

    it("draws nothing for an empty column", () => {
        expect(columnPath(0, BASELINE, 10, BASELINE)).toBe("");
    });

    it("rounds the data end and squares the baseline", () => {
        const path = columnPath(10, 50, 20, 100);

        expect(path.startsWith("M 10 100")).toBe(true);
        expect(path).toContain("Q");
        expect(path.endsWith("V 100 Z")).toBe(true);
    });

    it("maps zero to the baseline and the ceiling to the top", () => {
        const y = yScale(100);

        expect(y(0)).toBe(BASELINE);
        expect(y(100)).toBeLessThan(y(50));
    });
});

describe("labels", () => {
    it("compacts large axis values", () => {
        expect(formatCompact(500000)).toBe("500K");
        expect(formatCompact(1200000)).toBe("1.2M");
    });

    it("thins period labels but always keeps the latest", () => {
        const points = Array.from({ length: 12 }, (_, index) => ({
            period: `2026-${String(index + 1).padStart(2, "0")}`,
            amount: index,
        }));

        const labels = periodLabels(points, (index) => index);

        expect(labels.length).toBeLessThanOrEqual(7);
        expect(labels.at(-1)?.key).toBe("2026-12");
    });

    it("describes a point in full words for a screen reader", () => {
        expect(
            describePoint(
                { period: "2026-09", amount: 412500 },
                "calls",
                500000,
            ),
        ).toBe("Sep 2026: 412,500 calls, 83% of the limit");
    });

    it("omits the share when the metric has no limit", () => {
        expect(
            describePoint({ period: "2026-09", amount: 7 }, "seats", null),
        ).toBe("Sep 2026: 7 seats");
    });
});

describe("limitLabelSide", () => {
    const y = yScale(100);
    const centre = (index: number) => 60 + index * 50;
    const series = (...amounts: number[]) =>
        amounts.map((amount, index) => ({ period: `p${index}`, amount }));

    it("labels the limit on the right while the latest month is well under it", () => {
        expect(limitLabelSide(series(20, 30, 40, 50, 30), centre, y, 90)).toBe(
            "end",
        );
    });

    it("moves the label left when the latest month reaches the limit", () => {
        expect(limitLabelSide(series(20, 30, 40, 50, 95), centre, y, 90)).toBe(
            "start",
        );
    });

    it("drops the in-plot label when both ends crowd it, leaving it to the caption", () => {
        expect(
            limitLabelSide(series(95, 30, 40, 50, 95), centre, y, 90),
        ).toBeNull();
    });
});
