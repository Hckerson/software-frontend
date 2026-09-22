import { expect, signIn, test } from "./fixtures/session";
import { stubAdminUsersApi } from "./fixtures/admin-users-api";

test.describe("looking up and acting on a customer", () => {
    test.beforeEach(async ({ page, context }) => {
        await signIn(context, "ADMIN");
        await stubAdminUsersApi(page);
        await page.goto("/admin/users");
    });

    test("lists every account with its plan joined in", async ({ page }) => {
        const table = page.getByRole("table");

        await expect(table).toContainText("Casey Jones");
        await expect(table).toContainText("Sam Suspended");
        await expect(
            page.getByRole("row", { name: /Casey Jones/ }),
        ).toContainText("Pro");
    });

    test("finds an account by email", async ({ page }) => {
        await page.getByLabel("Search").fill("sam@");

        await expect(page.getByRole("table")).toContainText("Sam Suspended");
        await expect(page.getByRole("table")).not.toContainText("Casey Jones");
    });

    test("offers no action on the admin's own row", async ({ page }) => {
        const own = page.getByRole("row", { name: /Ada Admin/ });

        await expect(own).toContainText("You");
        await expect(own.getByRole("button")).toHaveCount(0);
    });

    test("suspends only after confirmation, and sends just the status", async ({
        page,
    }) => {
        const row = page.getByRole("row", { name: /Casey Jones/ });

        await row.getByRole("button", { name: "Suspend" }).click();

        const dialog = page.getByRole("dialog");

        await expect(dialog).toContainText("Suspend Casey Jones?");

        const sent = page.waitForRequest(
            (request) =>
                request.method() === "PATCH" &&
                request.url().endsWith("/api/users/user-1"),
        );

        await dialog.getByRole("button", { name: "Suspend" }).click();

        expect((await sent).postDataJSON()).toEqual({ status: "SUSPENDED" });
    });

    test("offers to reactivate a suspended account", async ({ page }) => {
        await expect(
            page
                .getByRole("row", { name: /Sam Suspended/ })
                .getByRole("button", { name: "Reactivate" }),
        ).toBeVisible();
    });
});
