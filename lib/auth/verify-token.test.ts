import { describe, expect, it, beforeAll } from "vitest";
import { generateKeyPairSync, createSign } from "node:crypto";
import { derFromPem, verifySessionToken } from "./verify-token";
import { nowSeconds } from "@/lib/utils/clock";

const b64url = (value: string | Buffer): string =>
    Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

let privateKey: string;
let publicKey: string;
let otherPrivateKey: string;

const keypair = () =>
    generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

const sign = (
    payload: Record<string, unknown>,
    key: string,
    alg = "RS256",
): string => {
    const head = b64url(JSON.stringify({ alg, typ: "JWT" }));
    const body = b64url(JSON.stringify(payload));
    const signer = createSign("RSA-SHA256");

    signer.update(`${head}.${body}`);

    return `${head}.${body}.${b64url(signer.sign(key))}`;
};

const claims = (overrides: Record<string, unknown> = {}) => ({
    sub: "user-1",
    email: "a@b.c",
    role: "USER",
    exp: nowSeconds() + 3600,
    ...overrides,
});

beforeAll(() => {
    const pair = keypair();

    privateKey = pair.privateKey;
    publicKey = pair.publicKey;
    otherPrivateKey = keypair().privateKey;
});

describe("verifySessionToken", () => {
    it("accepts a token signed by the matching private key", async () => {
        const result = await verifySessionToken(
            sign(claims(), privateKey),
            publicKey,
        );

        expect(result).toMatchObject({ sub: "user-1", role: "USER" });
    });

    it("rejects a token signed by a different key", async () => {
        expect(
            await verifySessionToken(
                sign(claims(), otherPrivateKey),
                publicKey,
            ),
        ).toBeNull();
    });

    it("rejects a forged token with no real signature", async () => {
        const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
        const body = b64url(JSON.stringify(claims({ role: "ADMIN" })));

        expect(
            await verifySessionToken(`${head}.${body}.forged`, publicKey),
        ).toBeNull();
    });

    it("rejects a tampered payload even with a valid signature block", async () => {
        const token = sign(claims(), privateKey);
        const [head, , signature] = token.split(".");
        const elevated = b64url(JSON.stringify(claims({ role: "ADMIN" })));

        expect(
            await verifySessionToken(
                `${head}.${elevated}.${signature}`,
                publicKey,
            ),
        ).toBeNull();
    });

    it("rejects the alg:none downgrade", async () => {
        const head = b64url(JSON.stringify({ alg: "none", typ: "JWT" }));
        const body = b64url(JSON.stringify(claims({ role: "ADMIN" })));

        expect(
            await verifySessionToken(`${head}.${body}.`, publicKey),
        ).toBeNull();
    });

    it("rejects an expired token", async () => {
        const expired = claims({ exp: nowSeconds() - 60 });

        expect(
            await verifySessionToken(sign(expired, privateKey), publicKey),
        ).toBeNull();
    });

    it("rejects a malformed token", async () => {
        expect(await verifySessionToken("not-a-jwt", publicKey)).toBeNull();
        expect(await verifySessionToken("", publicKey)).toBeNull();
    });

    it("accepts a base64-encoded PEM, as stored in the environment", async () => {
        const encoded = Buffer.from(publicKey, "utf8").toString("base64");

        expect(
            await verifySessionToken(sign(claims(), privateKey), encoded),
        ).toMatchObject({ role: "USER" });
    });
});

describe("derFromPem", () => {
    it("produces identical DER from raw and base64-wrapped PEM", () => {
        const encoded = Buffer.from(publicKey, "utf8").toString("base64");

        expect(Array.from(derFromPem(encoded))).toEqual(
            Array.from(derFromPem(publicKey)),
        );
    });
});
