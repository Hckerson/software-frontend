import { json } from "./api";
import type { Page } from "@playwright/test";

const PERIOD_START = "2026-09-01T00:00:00.000Z";
const PERIOD_END = "2026-09-30T00:00:00.000Z";

const PERIODS = [
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
];

const SERIES = {
    API_CALLS: [180000, 240000, 310000, 385000, 540000, 412500],
    STORAGE_GB: [42, 51, 58, 64, 71, 78],
    SEATS: [6, 7, 7, 8, 9, 10],
} as const;

export const proPlan = {
    id: "plan-pro",
    name: "Pro",
    description: "For teams shipping to production.",
    priceUSD: "49.00",
    planType: "PRO",
    features: {},
    limits: { API_CALLS: 500000, STORAGE_GB: 100, SEATS: 10 },
    overageRates: { API_CALLS: 0.0002, STORAGE_GB: 0.5 },
    isActive: true,
    createdAt: PERIOD_START,
    updatedAt: PERIOD_START,
};

export const customer = {
    id: "user-1",
    fullName: "Casey Jones",
    email: "user@meter.test",
    phoneNumber: null,
    avatar: null,
    bio: null,
    role: "USER",
    status: "ACTIVE",
    lastActive: PERIOD_START,
    createdAt: PERIOD_START,
    updatedAt: PERIOD_START,
};

export const usageHistory = Object.entries(SERIES).flatMap(
    ([metricType, amounts]) =>
        amounts.map((amount, index) => ({
            id: `${metricType}-${PERIODS[index]}`,
            subscriptionId: "sub-1",
            metricType,
            amount,
            period: PERIODS[index],
            createdAt: PERIOD_START,
            updatedAt: PERIOD_START,
        })),
);

const subscription = {
    id: "sub-1",
    userId: customer.id,
    planId: proPlan.id,
    startDate: PERIOD_START,
    renewalDate: PERIOD_END,
    canceledAt: null,
    currentBillingPeriodStart: PERIOD_START,
    currentBillingPeriodEnd: PERIOD_END,
    status: "ACTIVE",
    plan: proPlan,
};

const current = Object.entries(SERIES).map(([metricType, amounts]) => ({
    metricType,
    amount: amounts.at(-1),
    period: "2026-09",
}));

export const stubCustomerApi = async (page: Page): Promise<void> => {
    await page.route("**/api/**", (route) => json(route, []));
    await page.route("**/api/users/me", (route) => json(route, customer));
    await page.route("**/api/subscriptions/current", (route) =>
        json(route, subscription),
    );
    await page.route("**/api/usage/current", (route) => json(route, current));
    await page.route("**/api/usage/history", (route) =>
        json(route, usageHistory),
    );
};
