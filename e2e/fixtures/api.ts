import { BASE_URL } from "./urls";
import type { Page, Route } from "@playwright/test";

const NOW = "2026-09-20T00:00:00.000Z";

export const envelope = (data: unknown) => ({
    statusCode: 200,
    message: "OK",
    data,
    timestamp: NOW,
});

export const adminStats = {
    totalUsers: 42,
    activeUsers: 37,
    pendingUsers: 3,
    suspendedUsers: 2,
    activeSubscriptions: 31,
    pastDueSubscriptions: 4,
    canceledSubscriptions: 7,
    overdueInvoices: 5,
    timestamp: NOW,
};

export const billingStats = {
    activeSubscriptions: 31,
    totalSubscriptions: 44,
    churnRate: "4.2%",
    paidInvoices: 120,
    overdueInvoices: 5,
    timestamp: NOW,
};

export const cycleRun = {
    renewal: {
        examined: 3,
        changed: 1,
        skipped: 2,
        details: ["renewed sub_1"],
    },
    overdue: {
        examined: 4,
        changed: 2,
        skipped: 2,
        details: ["invoice inv_9"],
    },
};

const CORS = {
    "access-control-allow-origin": BASE_URL,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const preflight = (route: Route) =>
    route.fulfill({ status: 204, headers: CORS, body: "" });

const json = (route: Route, data: unknown, status = 200) =>
    route.request().method() === "OPTIONS"
        ? preflight(route)
        : route.fulfill({
              status,
              headers: { ...CORS, "content-type": "application/json" },
              body: JSON.stringify(envelope(data)),
          });

export const stubAdminApi = async (page: Page): Promise<void> => {
    await page.route("**/api/**", (route) => json(route, []));
    await page.route("**/api/admin/billing/cycle/run", (route) =>
        json(route, cycleRun),
    );
    await page.route("**/api/admin/billing/stats", (route) =>
        json(route, billingStats),
    );
    await page.route("**/api/admin/stats", (route) => json(route, adminStats));
};

export const failCycleWith = async (
    page: Page,
    status: number,
    message: string,
): Promise<void> => {
    await page.route("**/api/admin/billing/cycle/run", (route) =>
        route.request().method() === "OPTIONS"
            ? preflight(route)
            : route.fulfill({
                  status,
                  headers: { ...CORS, "content-type": "application/json" },
                  body: JSON.stringify({
                      statusCode: status,
                      message,
                      error: "Forbidden",
                      path: "/api/admin/billing/cycle/run",
                      timestamp: NOW,
                  }),
              }),
    );
};
