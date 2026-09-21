import { describe, expect, it } from "vitest";
import { loginTarget } from "@/lib/utils/login-redirect";
import { LOGIN_PATH, REDIRECT_PARAM } from "@/lib/constants";

describe("loginTarget", () => {
    it("carries the current path back as the redirect parameter", () => {
        expect(loginTarget("/invoices", "")).toBe(
            `${LOGIN_PATH}?${REDIRECT_PARAM}=%2Finvoices`,
        );
    });

    it("keeps the query string so a filtered view is restored", () => {
        const target = loginTarget("/admin/subscriptions", "?status=PAST_DUE");

        expect(
            new URL(target, "http://x").searchParams.get(REDIRECT_PARAM),
        ).toBe("/admin/subscriptions?status=PAST_DUE");
    });

    it("escapes a path so it cannot smuggle extra parameters", () => {
        const target = loginTarget("/invoices", "?a=1&next=/admin");

        expect(
            new URL(target, "http://x").searchParams.get(REDIRECT_PARAM),
        ).toBe("/invoices?a=1&next=/admin");
    });
});
