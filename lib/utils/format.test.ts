import { describe, expect, it } from "vitest";
import {
    formatCount,
    formatDate,
    formatMoney,
    formatPeriod,
    formatRate,
    titleCase,
} from "@/lib/utils/format";
import { EMPTY_VALUE } from "@/lib/constants";

describe("formatMoney", () => {
    it("renders a number as currency", () => {
        expect(formatMoney(1234.5)).toBe("$1,234.50");
    });

    it("accepts the decimal strings the API returns", () => {
        expect(formatMoney("49.00")).toBe("$49.00");
    });

    it("renders zero rather than treating it as absent", () => {
        expect(formatMoney(0)).toBe("$0.00");
    });

    it("falls back for absent or unparseable amounts", () => {
        expect(formatMoney(null)).toBe(EMPTY_VALUE);
        expect(formatMoney(undefined)).toBe(EMPTY_VALUE);
        expect(formatMoney("")).toBe(EMPTY_VALUE);
        expect(formatMoney("not money")).toBe(EMPTY_VALUE);
    });
});

describe("formatRate", () => {
    it("keeps the precision a per-unit price needs", () => {
        expect(formatRate(0.0002)).toBe("$0.0002");
        expect(formatRate(0.5)).toBe("$0.50");
    });

    it("does not collapse a sub-cent rate to zero the way formatMoney would", () => {
        expect(formatMoney(0.0002)).toBe("$0.00");
        expect(formatRate(0.0002)).not.toBe("$0.00");
    });

    it("falls back for an absent rate", () => {
        expect(formatRate(null)).toBe(EMPTY_VALUE);
        expect(formatRate(undefined)).toBe(EMPTY_VALUE);
    });
});

describe("formatCount", () => {
    it("groups thousands", () => {
        expect(formatCount(500000)).toBe("500,000");
    });

    it("renders zero rather than treating it as absent", () => {
        expect(formatCount(0)).toBe("0");
    });

    it("falls back for absent or non-finite counts", () => {
        expect(formatCount(null)).toBe(EMPTY_VALUE);
        expect(formatCount(undefined)).toBe(EMPTY_VALUE);
        expect(formatCount(Number.NaN)).toBe(EMPTY_VALUE);
    });
});

describe("formatDate", () => {
    it("renders an ISO date in the display format", () => {
        expect(formatDate("2026-09-20T00:00:00.000Z")).toBe("20 Sep 2026");
    });

    it("falls back when the date is absent", () => {
        expect(formatDate(null)).toBe(EMPTY_VALUE);
        expect(formatDate("")).toBe(EMPTY_VALUE);
    });

    it("returns the original string when it is not a date", () => {
        expect(formatDate("whenever")).toBe("whenever");
    });
});

describe("formatPeriod", () => {
    it("joins both ends of a billing period", () => {
        expect(
            formatPeriod(
                "2026-09-01T00:00:00.000Z",
                "2026-09-30T00:00:00.000Z",
            ),
        ).toBe("1 Sep 2026 – 30 Sep 2026");
    });

    it("keeps the separator when one end is missing", () => {
        expect(formatPeriod(null, null)).toBe(
            `${EMPTY_VALUE} – ${EMPTY_VALUE}`,
        );
    });
});

describe("titleCase", () => {
    it("turns a screaming snake enum into words", () => {
        expect(titleCase("PAST_DUE")).toBe("Past Due");
        expect(titleCase("API_CALLS")).toBe("Api Calls");
        expect(titleCase("ACTIVE")).toBe("Active");
    });
});
