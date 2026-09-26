import { createSign } from "node:crypto";
import { test as base } from "@playwright/test";
import { sessionKeys } from "./keys";
import { BASE_URL } from "./urls";
import type { BrowserContext } from "@playwright/test";

const AUTH_COOKIE = "access_token";
const ONE_HOUR = 3600;

const b64url = (value: string | Buffer): string =>
    Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

export const signSession = (
    claims: Record<string, unknown>,
    privateKey = sessionKeys().privateKey,
): string => {
    const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const body = b64url(JSON.stringify(claims));
    const signer = createSign("RSA-SHA256");

    signer.update(`${head}.${body}`);

    return `${head}.${body}.${b64url(signer.sign(privateKey))}`;
};

export const sessionFor = (role: "USER" | "ADMIN") => ({
    sub: role === "ADMIN" ? "admin-1" : "user-1",
    email: role === "ADMIN" ? "admin@meter.test" : "user@meter.test",
    role,
    exp: Math.floor(Date.now() / 1000) + ONE_HOUR,
});

export const signIn = async (
    context: BrowserContext,
    role: "USER" | "ADMIN",
): Promise<void> => {
    await context.addCookies([
        {
            name: AUTH_COOKIE,
            value: signSession(sessionFor(role)),
            url: BASE_URL,
            httpOnly: true,
        },
    ]);
};

export const test = base.extend<{ asAdmin: void; asUser: void }>({
    asAdmin: [
        async ({ context }, use) => {
            await signIn(context, "ADMIN");
            await use();
        },
        { auto: false },
    ],
    asUser: [
        async ({ context }, use) => {
            await signIn(context, "USER");
            await use();
        },
        { auto: false },
    ],
});

export { expect } from "@playwright/test";
