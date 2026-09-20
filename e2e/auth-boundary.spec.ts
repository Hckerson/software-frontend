import { expect, signIn, test } from "./fixtures/session";
import { BASE_URL } from "./fixtures/urls";

test.describe("the authentication boundary", () => {
    test("sends an anonymous visitor to login and remembers where they were going", async ({
        page,
    }) => {
        await page.goto("/invoices");

        await expect(page).toHaveURL(/\/auth\/login\?next=%2Finvoices/);
    });

    test("lets a signed-in customer reach their dashboard", async ({
        page,
        context,
    }) => {
        await signIn(context, "USER");
        await page.goto("/dashboard");

        await expect(page).toHaveURL(/\/dashboard/);
    });

    test("keeps a customer out of the admin console", async ({
        page,
        context,
    }) => {
        await signIn(context, "USER");
        await page.goto("/admin");

        await expect(page).toHaveURL(/\/dashboard/);
    });

    test("lets an admin into the admin console", async ({ page, context }) => {
        await signIn(context, "ADMIN");
        await page.goto("/admin");

        await expect(page).toHaveURL(/\/admin/);
    });

    test("refuses a token this deployment's key did not sign", async ({
        page,
        context,
    }) => {
        await context.addCookies([
            {
                name: "access_token",
                value: "not.a.token",
                url: BASE_URL,
            },
        ]);

        await page.goto("/dashboard");

        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("sends a signed-in visitor away from the login page", async ({
        page,
        context,
    }) => {
        await signIn(context, "USER");
        await page.goto("/auth/login");

        await expect(page).toHaveURL(/\/dashboard/);
    });
});
