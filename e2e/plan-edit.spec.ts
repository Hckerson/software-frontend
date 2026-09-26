import { expect, signIn, test } from "./fixtures/session";
import { growthPlan, stubPlansApi } from "./fixtures/plans-api";
import type { Page } from "@playwright/test";

const openEditor = async (page: Page) => {
    await page.goto("/admin/plans");
    await page.getByRole("button", { name: "Edit", exact: true }).click();

    return page.getByRole("dialog", { name: `Edit ${growthPlan.name}` });
};

test.describe("editing a plan from the catalogue", () => {
    test.beforeEach(async ({ context }) => {
        await signIn(context, "ADMIN");
    });

    test("opens seeded with the plan's current terms", async ({ page }) => {
        await stubPlansApi(page);
        const dialog = await openEditor(page);

        await expect(dialog.getByLabel("Name")).toHaveValue("Growth");
        await expect(dialog.getByLabel("Monthly price (USD)")).toHaveValue(
            "49.00",
        );
        await expect(dialog.getByLabel("API calls limit")).toHaveValue(
            "500000",
        );
        await expect(dialog.getByLabel("Seats limit")).toHaveValue("10");
        await expect(dialog.getByLabel("Storage limit")).toHaveValue("");
        await expect(dialog.getByLabel("API calls overage rate")).toHaveValue(
            "0.0002",
        );
        await expect(dialog.getByLabel("Seats overage rate")).toHaveValue("");
    });

    test("saving sends the change, closes, and the catalogue shows it", async ({
        page,
    }) => {
        const patches = await stubPlansApi(page);
        const dialog = await openEditor(page);

        await dialog.getByLabel("Monthly price (USD)").fill("59");
        await dialog.getByLabel("Seats limit").fill("25");
        await dialog.getByLabel("API calls overage rate").fill("");
        await dialog.getByRole("button", { name: "Save changes" }).click();

        await expect(dialog).toBeHidden();
        expect(patches).toHaveLength(1);
        expect(patches[0]).toMatchObject({
            priceUSD: 59,
            limits: { API_CALLS: 500000, SEATS: 25 },
        });
        expect(patches[0]?.overageRates).toEqual({});
        await expect(page.getByText("$59.00")).toBeVisible();
    });

    test("escape discards the edit and returns focus to the row", async ({
        page,
    }) => {
        const patches = await stubPlansApi(page);
        const dialog = await openEditor(page);

        await dialog.getByLabel("Name").fill("Renamed");
        await page.keyboard.press("Escape");

        await expect(dialog).toBeHidden();
        await expect(
            page.getByRole("button", { name: "Edit", exact: true }),
        ).toBeFocused();
        expect(patches).toHaveLength(0);
    });

    test("a refusal is shown inside the editor, which stays open", async ({
        page,
    }) => {
        await stubPlansApi(page, {
            status: 409,
            message: "A plan with that name already exists",
        });
        const dialog = await openEditor(page);

        await dialog.getByRole("button", { name: "Save changes" }).click();

        await expect(
            dialog
                .getByRole("alert")
                .filter({ hasText: "A plan with that name already exists" }),
        ).toBeVisible();
        await expect(dialog).toBeVisible();
    });
});
