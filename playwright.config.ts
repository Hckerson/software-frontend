import { defineConfig, devices } from "@playwright/test";
import { sessionKeys } from "./e2e/fixtures/keys";
import { API_URL, BASE_URL, PORT } from "./e2e/fixtures/urls";

const SERVER_START_MS = 180_000;

const { publicKey } = sessionKeys();

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "line" : "list",
    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], channel: "chromium" },
        },
    ],
    webServer: {
        command: `npx next dev --port ${PORT}`,
        url: BASE_URL,
        timeout: SERVER_START_MS,
        reuseExistingServer: !process.env.CI,
        env: {
            AUTH_JWT_PUBLIC_KEY: publicKey,
            NEXT_PUBLIC_API_URL: API_URL,
        },
    },
});
