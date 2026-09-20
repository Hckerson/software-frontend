import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export interface SessionKeys {
    privateKey: string;
    publicKey: string;
}

const CACHE = resolve(
    process.cwd(),
    "node_modules/.cache/meter-e2e/session-keys.json",
);

const generate = (): SessionKeys =>
    generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

export const sessionKeys = (): SessionKeys => {
    if (existsSync(CACHE)) {
        return JSON.parse(readFileSync(CACHE, "utf8")) as SessionKeys;
    }

    const keys = generate();

    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(keys), "utf8");

    return keys;
};
