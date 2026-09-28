import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { backendFetch, readJson } from "./api-server";

const cookieJar = vi.hoisted<{ token: string | undefined }>(() => ({
    token: undefined,
}));

vi.mock("next/headers", () => ({
    cookies: () =>
        Promise.resolve({
            get: (name: string) =>
                name === AUTH_COOKIE && cookieJar.token
                    ? { value: cookieJar.token }
                    : undefined,
        }),
}));

const headersOfLastCall = () => {
    const [, init] = vi.mocked(fetch).mock.calls[0];
    return new Headers(init?.headers);
};

beforeEach(() => {
    cookieJar.token = undefined;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("calling the backend from the server", () => {
    it("forwards the session cookie as a bearer token", async () => {
        cookieJar.token = "signed.jwt.value";

        await backendFetch(routes.usersGetMe());

        expect(headersOfLastCall().get("authorization")).toBe(
            "Bearer signed.jwt.value",
        );
    });

    it("sends no authorization at all when there is no session", async () => {
        await backendFetch(routes.authLogin(), { method: "POST" });

        expect(headersOfLastCall().get("authorization")).toBeNull();
    });

    it("resolves the path against the backend, not the app origin", async () => {
        await backendFetch(routes.usersGetMe());

        expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
            `${API_BASE_URL}${routes.usersGetMe()}`,
        );
    });

    it("never serves a stale authenticated response", async () => {
        await backendFetch(routes.usersGetMe());

        const [, init] = vi.mocked(fetch).mock.calls[0];
        expect(init?.cache).toBe("no-store");
    });
});

describe("reading a body", () => {
    it("yields null instead of throwing on a body that is not json", async () => {
        expect(await readJson(new Response("not json"))).toBeNull();
    });
});
