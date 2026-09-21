import { describe, expect, it } from "vitest";
import { matchesSearch, subscriptionFor } from "@/lib/utils/customers";
import type { AccountUser, Subscription } from "@/lib/types";

const subscription = (
    id: string,
    userId: string,
    status: Subscription["status"],
    start: string,
): Subscription =>
    ({
        id,
        userId,
        status,
        currentBillingPeriodStart: start,
    }) as Subscription;

const user = {
    fullName: "Casey Jones",
    email: "casey@meter.test",
} as AccountUser;

describe("subscriptionFor", () => {
    it("finds the subscription that belongs to the user", () => {
        const subs = [
            subscription("a", "someone-else", "ACTIVE", "2026-09-01"),
            subscription("b", "casey", "ACTIVE", "2026-09-01"),
        ];

        expect(subscriptionFor("casey", subs)?.id).toBe("b");
    });

    it("prefers the live subscription over a newer canceled one", () => {
        const subs = [
            subscription("old-active", "casey", "ACTIVE", "2026-01-01"),
            subscription("new-canceled", "casey", "CANCELED", "2026-09-01"),
        ];

        expect(subscriptionFor("casey", subs)?.id).toBe("old-active");
    });

    it("prefers past due over canceled, because it still needs attention", () => {
        const subs = [
            subscription("canceled", "casey", "CANCELED", "2026-09-01"),
            subscription("past-due", "casey", "PAST_DUE", "2026-08-01"),
        ];

        expect(subscriptionFor("casey", subs)?.id).toBe("past-due");
    });

    it("breaks a tie on status by the newest billing period", () => {
        const subs = [
            subscription("older", "casey", "CANCELED", "2026-05-01"),
            subscription("newer", "casey", "CANCELED", "2026-08-01"),
        ];

        expect(subscriptionFor("casey", subs)?.id).toBe("newer");
    });

    it("returns nothing for a user who never subscribed", () => {
        expect(subscriptionFor("casey", [])).toBeUndefined();
    });
});

describe("matchesSearch", () => {
    it("matches every account when the search is empty or blank", () => {
        expect(matchesSearch(user, "")).toBe(true);
        expect(matchesSearch(user, "   ")).toBe(true);
    });

    it("matches on name or email, ignoring case", () => {
        expect(matchesSearch(user, "CASEY")).toBe(true);
        expect(matchesSearch(user, "jones")).toBe(true);
        expect(matchesSearch(user, "meter.test")).toBe(true);
    });

    it("rejects an account that matches neither", () => {
        expect(matchesSearch(user, "ada")).toBe(false);
    });
});
