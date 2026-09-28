import { describe, expect, it } from "vitest";
import { HOME_PATH } from "@/lib/constants";
import { internalPath } from "./internal-path";

describe("post-login redirect targets", () => {
    it("keeps a path within the app", () => {
        expect(internalPath("/invoices?page=2")).toBe("/invoices?page=2");
    });

    it("refuses an absolute url pointing off-site", () => {
        expect(internalPath("https://evil.test/steal")).toBe(HOME_PATH);
    });

    it("refuses a protocol-relative url, which also leaves the site", () => {
        expect(internalPath("//evil.test/steal")).toBe(HOME_PATH);
    });

    it("falls back home when nothing was requested", () => {
        expect(internalPath(null)).toBe(HOME_PATH);
        expect(internalPath(undefined)).toBe(HOME_PATH);
    });
});
