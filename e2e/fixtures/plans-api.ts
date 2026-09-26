import { envelope, stubAdminApi } from "./api";
import { BASE_URL } from "./urls";
import type { Page, Route } from "@playwright/test";

const STAMP = "2026-09-01T00:00:00.000Z";

const CORS = {
    "access-control-allow-origin": BASE_URL,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

export const growthPlan = {
    id: "plan-growth",
    name: "Growth",
    description: "For teams scaling past the free tier.",
    priceUSD: "49.00",
    planType: "PRO",
    features: {},
    limits: { API_CALLS: 500000, SEATS: 10 } as Record<string, number>,
    overageRates: { API_CALLS: 0.0002 } as Record<string, number>,
    isActive: true,
    createdAt: STAMP,
    updatedAt: STAMP,
};

export interface PlanPatch {
    name?: string;
    priceUSD?: number;
    limits?: Record<string, number>;
    overageRates?: Record<string, number>;
}

const respond = (route: Route, status: number, body: unknown) =>
    route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: CORS, body: "" })
        : route.fulfill({
              status,
              headers: { ...CORS, "content-type": "application/json" },
              body: JSON.stringify(body),
          });

export const stubPlansApi = async (
    page: Page,
    refusal?: { status: number; message: string },
): Promise<PlanPatch[]> => {
    const patches: PlanPatch[] = [];
    let current = { ...growthPlan };

    await stubAdminApi(page);
    await page.route("**/api/billing/plans", (route) =>
        respond(route, 200, envelope([current])),
    );
    await page.route("**/api/billing/plans/*", (route) => {
        if (route.request().method() !== "PATCH") {
            return respond(route, 200, envelope(current));
        }

        const patch = route.request().postDataJSON() as PlanPatch;
        patches.push(patch);

        if (refusal) {
            return respond(route, refusal.status, {
                statusCode: refusal.status,
                message: refusal.message,
                path: "/api/billing/plans",
                timestamp: STAMP,
            });
        }

        current = {
            ...current,
            ...patch,
            priceUSD: String(patch.priceUSD ?? current.priceUSD),
        };

        return respond(route, 200, envelope(current));
    });

    return patches;
};
