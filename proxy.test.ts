import { createSign, generateKeyPairSync } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";
import {
    ADMIN_ROLE,
    AUTH_COOKIE,
    HOME_PATH,
    LOGIN_PATH,
    REDIRECT_PARAM,
} from "@/lib/constants";
import { nowSeconds } from "@/lib/utils/clock";
import { proxy } from "./proxy";

const real = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const b64url = (value: string | Buffer): string =>
    Buffer.from(value).toString("base64url");

const signToken = (role: string): string => {
    const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const body = b64url(
        JSON.stringify({
            sub: "usr_1",
            email: "user@example.com",
            role,
            exp: nowSeconds() + 3600,
        }),
    );
    const signer = createSign("RSA-SHA256");

    signer.update(`${head}.${body}`);

    return `${head}.${body}.${b64url(signer.sign(real.privateKey))}`;
};

let userToken: string;
let adminToken: string;

const requestFor = (path: string, token?: string) => {
    const request = new NextRequest(new URL(`https://app.test${path}`));
    if (token) request.cookies.set(AUTH_COOKIE, token);
    return request;
};

const locationOf = (response: Response) =>
    new URL(response.headers.get("location") ?? "https://app.test/");

beforeAll(() => {
    process.env.AUTH_JWT_PUBLIC_KEY = Buffer.from(real.publicKey).toString(
        "base64",
    );
    userToken = signToken("USER");
    adminToken = signToken(ADMIN_ROLE);
});

describe("route protection", () => {
    it("sends an anonymous visitor on a protected route to the login page", async () => {
        const response = await proxy(requestFor("/dashboard"));

        expect(response.status).toBe(307);
        expect(locationOf(response).pathname).toBe(LOGIN_PATH);
    });

    it("remembers where the visitor was headed, query included", async () => {
        const response = await proxy(requestFor("/invoices?page=2"));

        expect(locationOf(response).searchParams.get(REDIRECT_PARAM)).toBe(
            "/invoices?page=2",
        );
    });

    it("lets a verified session through to a protected route", async () => {
        const response = await proxy(requestFor("/dashboard", userToken));

        expect(response.headers.get("location")).toBeNull();
    });

    it("treats a forged cookie as no session at all", async () => {
        const forged = `${userToken.split(".").slice(0, 2).join(".")}.forged`;
        const response = await proxy(requestFor("/dashboard", forged));

        expect(locationOf(response).pathname).toBe(LOGIN_PATH);
    });

    it("keeps a customer out of the admin area", async () => {
        const response = await proxy(requestFor("/admin/users", userToken));

        expect(locationOf(response).pathname).toBe(HOME_PATH);
    });

    it("lets an admin into the admin area", async () => {
        const response = await proxy(requestFor("/admin/users", adminToken));

        expect(response.headers.get("location")).toBeNull();
    });

    it("leaves public routes open to anyone", async () => {
        const response = await proxy(requestFor("/"));

        expect(response.headers.get("location")).toBeNull();
    });

    it("bounces a signed-in visitor away from the auth pages", async () => {
        const response = await proxy(requestFor(LOGIN_PATH, userToken));

        expect(locationOf(response).pathname).toBe(HOME_PATH);
    });

    it("leaves the auth pages reachable while signed out", async () => {
        const response = await proxy(requestFor(LOGIN_PATH));

        expect(response.headers.get("location")).toBeNull();
    });
});
