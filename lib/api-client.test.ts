import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "@/lib/contract/routes";
import type { ApiResponse } from "@/lib/types";
import { query } from "./api-client";

const transport = vi.hoisted(() => ({
    request: vi.fn(),
    interceptors: { response: { use: vi.fn() } },
}));

vi.mock("axios", () => ({ default: { create: () => transport } }));

const envelope = <T>(data: T): ApiResponse<T> => ({
    statusCode: 200,
    message: "Success",
    timestamp: "2026-09-06T00:00:00.000Z",
    data,
});

beforeEach(() => {
    transport.request.mockReset();
});

describe("browser transport", () => {
    it("rejects a failed request instead of fabricating a success", async () => {
        transport.request.mockRejectedValue(new Error("network is down"));

        await expect(query.get(routes.usersFindAll())).rejects.toThrow(
            "network is down",
        );
    });

    it("unwraps the payload from the envelope the backend sent", async () => {
        const users = [{ id: "user-1" }];
        transport.request.mockResolvedValue({ data: envelope(users) });

        expect(await query.get(routes.usersFindAll())).toEqual(users);
    });

    it("passes the method and url straight through", async () => {
        transport.request.mockResolvedValue({ data: envelope(null) });

        await query.delete(routes.usersRemove("user-1"));

        expect(transport.request).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "DELETE",
                url: routes.usersRemove("user-1"),
            }),
        );
    });

    it("sends the body on a write", async () => {
        transport.request.mockResolvedValue({ data: envelope(null) });

        await query.post(routes.authLogin(), { email: "a@b.c" });

        expect(transport.request).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "POST",
                data: { email: "a@b.c" },
            }),
        );
    });
});
