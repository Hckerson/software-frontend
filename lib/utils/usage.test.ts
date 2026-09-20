import { describe, expect, it } from "vitest";
import { limitFor, meterState, usageFor, usageRatio } from "@/lib/utils/usage";
import type { MetricUsage } from "@/lib/types";

const usage = (
    metricType: MetricUsage["metricType"],
    amount: number,
): MetricUsage => ({ metricType, amount, period: "2026-09" });

describe("limitFor", () => {
    it("reads the cap for a metric", () => {
        expect(limitFor({ API_CALLS: 500_000 }, "API_CALLS")).toBe(500_000);
    });

    it("treats a missing cap as unlimited, matching the backend", () => {
        expect(limitFor({ SEATS: 5 }, "API_CALLS")).toBeNull();
        expect(limitFor({}, "API_CALLS")).toBeNull();
        expect(limitFor(undefined, "API_CALLS")).toBeNull();
    });

    it("treats a non-positive cap as unlimited, matching the backend", () => {
        expect(limitFor({ API_CALLS: 0 }, "API_CALLS")).toBeNull();
        expect(limitFor({ API_CALLS: -1 }, "API_CALLS")).toBeNull();
    });

    it("ignores a cap that is not a number", () => {
        expect(limitFor({ API_CALLS: "500" }, "API_CALLS")).toBeNull();
    });
});

describe("usageFor", () => {
    it("finds the amount recorded for a metric", () => {
        const entries = [usage("API_CALLS", 120), usage("SEATS", 3)];

        expect(usageFor(entries, "SEATS")).toBe(3);
    });

    it("reports nothing consumed when the metric is absent", () => {
        expect(usageFor([], "STORAGE_GB")).toBe(0);
    });
});

describe("usageRatio", () => {
    it("expresses consumption as a percentage of the limit", () => {
        expect(usageRatio(25, 100)).toBe(25);
        expect(usageRatio(412_500, 500_000)).toBe(82.5);
    });

    it("can exceed one hundred so the meter can say so", () => {
        expect(usageRatio(250, 100)).toBe(250);
    });

    it("avoids dividing by an absent limit", () => {
        expect(usageRatio(10, 0)).toBe(0);
    });
});

describe("meterState", () => {
    it("stays normal below the warning threshold", () => {
        expect(meterState(0)).toBe("normal");
        expect(meterState(74.9)).toBe("normal");
    });

    it("warns from seventy-five percent", () => {
        expect(meterState(75)).toBe("warning");
        expect(meterState(99.9)).toBe("warning");
    });

    it("reports exceeded at and beyond the limit", () => {
        expect(meterState(100)).toBe("exceeded");
        expect(meterState(250)).toBe("exceeded");
    });
});
