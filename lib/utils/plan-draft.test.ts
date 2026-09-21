import { describe, expect, it } from "vitest";
import { toDraft, toLimits, toOverageRates } from "@/lib/utils/plan-draft";

describe("toLimits", () => {
    it("keeps only positive whole numbers", () => {
        expect(
            toLimits({ API_CALLS: "500000", STORAGE_GB: "100", SEATS: "10" }),
        ).toEqual({ API_CALLS: 500000, STORAGE_GB: 100, SEATS: 10 });
    });

    it("drops a blank field, so that metric is unlimited", () => {
        expect(toLimits({ API_CALLS: "500000", SEATS: "" })).toEqual({
            API_CALLS: 500000,
        });
    });

    it("drops zero and negative entries rather than storing them", () => {
        expect(toLimits({ API_CALLS: "0", SEATS: "-5" })).toEqual({});
    });

    it("ignores a field that is not a number", () => {
        expect(toLimits({ API_CALLS: "lots" })).toEqual({});
    });
});

describe("toOverageRates", () => {
    it("keeps fractional rates, which a limit parser would truncate", () => {
        expect(toOverageRates({ API_CALLS: "0.0002" })).toEqual({
            API_CALLS: 0.0002,
        });
    });

    it("drops a blank rate, leaving that limit a hard cap", () => {
        expect(toOverageRates({ API_CALLS: "0.0002", SEATS: "" })).toEqual({
            API_CALLS: 0.0002,
        });
    });

    it("drops a zero rate rather than storing an unbillable one", () => {
        expect(toOverageRates({ SEATS: "0" })).toEqual({});
    });
});

describe("toDraft", () => {
    it("seeds an edit form from a stored plan", () => {
        expect(toDraft({ API_CALLS: 500000, SEATS: 10 })).toEqual({
            API_CALLS: "500000",
            SEATS: "10",
        });
    });

    it("leaves an unlimited metric blank rather than writing zero", () => {
        expect(toDraft({ API_CALLS: 500000 })).not.toHaveProperty("SEATS");
    });

    it("round-trips through toLimits unchanged", () => {
        expect(
            toLimits(toDraft({ API_CALLS: 500000, STORAGE_GB: 100 })),
        ).toEqual({ API_CALLS: 500000, STORAGE_GB: 100 });
    });

    it("ignores a non-numeric value the contract types as unknown", () => {
        expect(toDraft({ API_CALLS: "lots" })).toEqual({});
    });
});
