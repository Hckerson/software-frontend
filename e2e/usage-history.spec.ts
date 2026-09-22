import { expect, signIn, test } from "./fixtures/session";
import { stubCustomerApi } from "./fixtures/customer-api";

test.describe("usage history charts", () => {
    test.beforeEach(async ({ page, context }) => {
        await signIn(context, "USER");
        await stubCustomerApi(page);
        await page.goto("/usage");
    });

    test("draws one chart per metric, each on its own scale", async ({
        page,
    }) => {
        const charts = page.locator(".trend-chart");

        await expect(charts).toHaveCount(3);
        await expect(charts.nth(0)).toContainText("API calls");
        await expect(charts.nth(0)).toContainText("Limit 500K");
        await expect(charts.nth(2)).toContainText("Limit 10");
    });

    test("a keyboard user gets the same readout as a pointer user", async ({
        page,
    }) => {
        const august = page.getByRole("img", {
            name: "Aug 2026: 540,000 calls, 108% of the limit",
        });

        await august.focus();

        await expect(page.locator(".trend-tooltip")).toContainText(
            "540,000 calls",
        );
    });

    test("every plotted value is also available as a table", async ({
        page,
    }) => {
        await page.getByText("Show the numbers as a table").click();

        await expect(page.getByRole("table")).toContainText("412,500");
    });
});
