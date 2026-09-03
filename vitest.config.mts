import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const TS_MORPH_WARMUP_MS = 30_000;

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["tools/**/*.test.ts", "lib/**/*.test.ts"],
        testTimeout: TS_MORPH_WARMUP_MS,
    },
});
