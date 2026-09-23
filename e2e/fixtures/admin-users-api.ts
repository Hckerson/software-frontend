import { json, stubAdminApi } from "./api";
import { customer, proPlan } from "./customer-api";
import type { Page } from "@playwright/test";

const JOINED = "2026-06-01T00:00:00.000Z";

export const admin = {
    ...customer,
    id: "admin-1",
    fullName: "Ada Admin",
    email: "admin@meter.test",
    role: "ADMIN",
};

const suspended = {
    ...customer,
    id: "user-2",
    fullName: "Sam Suspended",
    email: "sam@meter.test",
    status: "SUSPENDED",
    createdAt: JOINED,
};

export const accounts = [admin, customer, suspended];

const subscriptions = [
    {
        id: "sub-1",
        userId: customer.id,
        planId: proPlan.id,
        startDate: JOINED,
        renewalDate: JOINED,
        canceledAt: null,
        currentBillingPeriodStart: "2026-09-01T00:00:00.000Z",
        currentBillingPeriodEnd: "2026-09-30T00:00:00.000Z",
        status: "ACTIVE",
        plan: proPlan,
        user: customer,
    },
];

export const stubAdminUsersApi = async (page: Page): Promise<void> => {
    await stubAdminApi(page);
    await page.route("**/api/admin/billing/subscriptions", (route) =>
        json(route, subscriptions),
    );
    await page.route("**/api/users", (route) => json(route, accounts));
    await page.route("**/api/users/*", (route) => {
        const body = route.request().postDataJSON() as {
            status?: string;
        } | null;
        const id = route.request().url().split("/").at(-1);
        const account = accounts.find((one) => one.id === id);

        return json(route, { ...account, ...(body ?? {}) });
    });
    await page.route("**/api/users/me", (route) => json(route, admin));
};
