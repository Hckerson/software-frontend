import { hasElapsed } from "@/lib/utils/clock";
import type { SessionClaims } from "@/lib/types";

const ALGORITHM = "RS256";
const PARTS = 3;

const IMPORT_PARAMS: RsaHashedImportParams = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
};

const keyCache = new Map<string, Promise<CryptoKey>>();

const bytesFromBase64 = (value: string): Uint8Array =>
    Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

const fromBase64Url = (value: string): Uint8Array =>
    bytesFromBase64(value.replace(/-/g, "+").replace(/_/g, "/"));

const jsonFromBase64Url = (value: string): Record<string, unknown> | null => {
    try {
        const decoded = new TextDecoder().decode(fromBase64Url(value));
        const parsed: unknown = JSON.parse(decoded);

        return typeof parsed === "object" && parsed !== null
            ? (parsed as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
};

export const derFromPem = (key: string): Uint8Array => {
    const pem = key.includes("-----BEGIN")
        ? key
        : new TextDecoder().decode(bytesFromBase64(key));

    const body = pem
        .replace(/-----BEGIN [^-]+-----/, "")
        .replace(/-----END [^-]+-----/, "")
        .replace(/\s+/g, "");

    return bytesFromBase64(body);
};

const importKey = (publicKey: string): Promise<CryptoKey> => {
    const cached = keyCache.get(publicKey);

    if (cached) return cached;

    const imported = crypto.subtle.importKey(
        "spki",
        derFromPem(publicKey) as BufferSource,
        IMPORT_PARAMS,
        false,
        ["verify"],
    );

    keyCache.set(publicKey, imported);

    return imported;
};

const asClaims = (payload: Record<string, unknown>): SessionClaims | null =>
    typeof payload.sub === "string" && typeof payload.role === "string"
        ? {
              sub: payload.sub,
              role: payload.role,
              email: typeof payload.email === "string" ? payload.email : "",
              exp: typeof payload.exp === "number" ? payload.exp : undefined,
          }
        : null;

export const verifySessionToken = async (
    token: string,
    publicKey: string,
): Promise<SessionClaims | null> => {
    const segments = token.split(".");

    if (segments.length !== PARTS) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = segments;
    const header = jsonFromBase64Url(encodedHeader);

    if (header?.alg !== ALGORITHM) return null;

    let isValid = false;

    try {
        isValid = await crypto.subtle.verify(
            IMPORT_PARAMS.name,
            await importKey(publicKey),
            fromBase64Url(encodedSignature) as BufferSource,
            new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
        );
    } catch {
        return null;
    }

    if (!isValid) return null;

    const payload = jsonFromBase64Url(encodedPayload);
    const claims = payload ? asClaims(payload) : null;

    if (!claims) return null;

    const isExpired = claims.exp !== undefined && hasElapsed(claims.exp);

    return isExpired ? null : claims;
};
