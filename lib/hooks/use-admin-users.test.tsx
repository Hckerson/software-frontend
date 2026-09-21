import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { queryWrapper } from "@/tools/testing/query-wrapper";
import { query } from "@/lib/api-client";
import { queryKeys } from "@/lib/hooks/query-keys";
import {
    useAdminUsers,
    useSetAccountStatus,
} from "@/lib/hooks/use-admin-users";

vi.mock("@/lib/api-client", () => ({
    query: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(query.get).mockResolvedValue([]);
    vi.mocked(query.patch).mockResolvedValue({});
});

describe("admin user hooks", () => {
    it("lists every account through the admin-only endpoint", async () => {
        const { wrapper } = queryWrapper();
        const { result } = renderHook(() => useAdminUsers(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(query.get).toHaveBeenCalledWith("/api/users");
    });

    it("changes only the status field, so nothing else about the account moves", async () => {
        const { wrapper } = queryWrapper();
        const { result } = renderHook(() => useSetAccountStatus(), {
            wrapper,
        });

        result.current.mutate({ id: "u1", status: "SUSPENDED" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(query.patch).toHaveBeenCalledWith("/api/users/u1", {
            status: "SUSPENDED",
        });
    });

    it("refreshes the admin views, including the suspended-account counter", async () => {
        const { client, wrapper } = queryWrapper();
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useSetAccountStatus(), {
            wrapper,
        });

        result.current.mutate({ id: "u1", status: "ACTIVE" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.admin });
    });
});
