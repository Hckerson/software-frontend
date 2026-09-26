import { describe, expect, it } from "vitest";
import { queryString } from "./query-string";

describe("queryString", () => {
    it("encodes every defined value behind a leading ?", () => {
        expect(queryString({ period: "month", date: "2026-03-15" })).toBe(
            "?period=month&date=2026-03-15",
        );
    });

    it("drops undefined values", () => {
        expect(queryString({ period: "day", date: undefined })).toBe(
            "?period=day",
        );
    });

    it("returns nothing when there is nothing to send", () => {
        expect(queryString()).toBe("");
        expect(queryString({ date: undefined })).toBe("");
    });

    it("escapes reserved characters", () => {
        expect(queryString({ search: "a&b c" })).toBe("?search=a%26b+c");
    });
});
