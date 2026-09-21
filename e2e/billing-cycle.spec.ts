import { expect, signIn, test } from "./fixtures/session";
import { failCycleWith, stubAdminApi } from "./fixtures/api";

test.describe("running the billing cycle from the console", () => {
    test.beforeEach(async ({ page, context }) => {
        await signIn(context, "ADMIN");
        await stubAdminApi(page);
    });

    test("an admin can reach the cycle controls on the overview", async ({
        page,
    }) => {
        await page.goto("/admin");

        await expect(
            page.getByRole("button", { name: "Run full cycle" }),
        ).toBeVisible();
    });

    test("the run is confirmed before anything is billed", async ({ page }) => {
        await page.goto("/admin");
        await page.getByRole("button", { name: "Run full cycle" }).click();

        const dialog = page.getByRole("dialog");

        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText("Run the full billing cycle?");
    });

    test("confirming runs the cycle and reports both halves", async ({
        page,
    }) => {
        await page.goto("/admin");
        await page.getByRole("button", { name: "Run full cycle" }).click();
        await page.getByRole("button", { name: "Run cycle" }).click();

        await expect(page.getByText("Renewal")).toBeVisible();
        await expect(page.getByText(/1 changed/)).toBeVisible();
        await expect(page.getByText(/2 changed/)).toBeVisible();
    });

    test("escape closes the dialog without running", async ({ page }) => {
        await page.goto("/admin");
        await page.getByRole("button", { name: "Run full cycle" }).click();
        await page.keyboard.press("Escape");

        await expect(page.getByRole("dialog")).toBeHidden();
        await expect(page.getByText(/No cycle has been run/)).toBeVisible();
    });

    test("a refusal from the API is shown, not swallowed", async ({ page }) => {
        await failCycleWith(page, 403, "Forbidden resource");

        await page.goto("/admin");
        await page.getByRole("button", { name: "Run full cycle" }).click();
        await page.getByRole("button", { name: "Run cycle" }).click();

        await expect(
            page.getByRole("alert").filter({ hasText: "Forbidden resource" }),
        ).toBeVisible();
    });
});
