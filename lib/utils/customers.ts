import type { AccountUser, Subscription } from "@/lib/types";

const RANK: Record<Subscription["status"], number> = {
    ACTIVE: 0,
    PAST_DUE: 1,
    SUSPENDED: 2,
    CANCELED: 3,
};

const newestFirst = (a: Subscription, b: Subscription): number =>
    b.currentBillingPeriodStart.localeCompare(a.currentBillingPeriodStart);

export const subscriptionFor = (
    userId: string,
    subscriptions: Subscription[],
): Subscription | undefined =>
    subscriptions
        .filter((subscription) => subscription.userId === userId)
        .sort(
            (a, b) => RANK[a.status] - RANK[b.status] || newestFirst(a, b),
        )[0];

export const matchesSearch = (user: AccountUser, term: string): boolean => {
    const needle = term.trim().toLowerCase();

    return (
        needle === "" ||
        user.email.toLowerCase().includes(needle) ||
        user.fullName.toLowerCase().includes(needle)
    );
};
