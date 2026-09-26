import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const TS_MORPH_WARMUP_MS = 30_000;

const resolve = {
    alias: {
        "@": fileURLToPath(new URL(".", import.meta.url)),
        "server-only": fileURLToPath(
            new URL("./node_modules/server-only/empty.js", import.meta.url),
        ),
    },
};

export default defineConfig({
    resolve,
    test: {
        projects: [
            {
                resolve,
                test: {
                    name: "node",
                    environment: "node",
                    include: [
                        "*.test.ts",
                        "tools/**/*.test.ts",
                        "lib/**/*.test.ts",
                    ],
                    testTimeout: TS_MORPH_WARMUP_MS,
                },
            },
            {
                plugins: [react()],
                resolve,
                test: {
                    name: "react",
                    environment: "jsdom",
                    include: ["components/**/*.test.tsx", "lib/**/*.test.tsx"],
                    setupFiles: ["./tools/testing/setup-components.ts"],
                },
            },
        ],
    },
});
