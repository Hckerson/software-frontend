import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MOTION_DURATION } from "./constants";

const DURATION_TOKEN = /--durations-(\w+):\s*(\d+)ms;/g;

const durationTokens = () =>
    Object.fromEntries(
        [
            ...readFileSync(
                join(process.cwd(), "styles", "tokens.css"),
                "utf8",
            ).matchAll(DURATION_TOKEN),
        ].map(([, name, ms]) => [name, Number(ms) / 1000]),
    );

describe("MOTION_DURATION", () => {
    it("mirrors every --durations-* token in styles/tokens.css", () => {
        expect(MOTION_DURATION).toEqual(durationTokens());
    });
});
