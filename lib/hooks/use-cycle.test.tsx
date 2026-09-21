import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { queryWrapper } from "@/tools/testing/query-wrapper";
import { query } from "@/lib/api-client";
import { queryKeys } from "@/lib/hooks/query-keys";
import {
    useIssueInvoice,
    useRenewSubscriptions,
    useRunCycle,
    useSweepOverdueInvoices,
} from "@/lib/hooks/use-cycle";

vi.mock("@/lib/api-client", () => ({
    query: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

const post = vi.mocked(query.post);

const summary = { examined: 2, changed: 1, skipped: 1, details: [] };

beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue(summary);
});

describe("cycle mutations", () => {
    it("runs the whole cycle against the admin endpoint", async () => {
        const { wrapper } = queryWrapper();
        const { result } = renderHook(() => useRunCycle(), { wrapper });

        result.current.mutate();

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(post).toHaveBeenCalledWith("/api/admin/billing/cycle/run", {});
    });

    it("renews and sweeps through their own endpoints", async () => {
        const { wrapper } = queryWrapper();
        const renew = renderHook(() => useRenewSubscriptions(), { wrapper });

        renew.result.current.mutate();
        await waitFor(() => expect(renew.result.current.isSuccess).toBe(true));

        const sweep = renderHook(() => useSweepOverdueInvoices(), { wrapper });

        sweep.result.current.mutate();
        await waitFor(() => expect(sweep.result.current.isSuccess).toBe(true));

        expect(post).toHaveBeenCalledWith("/api/admin/billing/cycle/renew", {});
        expect(post).toHaveBeenCalledWith(
            "/api/admin/billing/cycle/sweep-overdue",
            {},
        );
    });

    it("scopes an issued invoice to the subscription it was asked for", async () => {
        const { wrapper } = queryWrapper();
        const { result } = renderHook(() => useIssueInvoice(), { wrapper });

        result.current.mutate("sub_123");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(post).toHaveBeenCalledWith(
            "/api/admin/billing/cycle/subscriptions/sub_123/issue-invoice",
            {},
        );
    });

    it("refreshes every admin view once the cycle has changed the data", async () => {
        const { client, wrapper } = queryWrapper();
        const invalidate = vi.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useRunCycle(), { wrapper });

        result.current.mutate();

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.admin });
    });

    it("surfaces a failure instead of reporting success", async () => {
        post.mockRejectedValueOnce(new Error("403"));

        const { wrapper } = queryWrapper();
        const { result } = renderHook(() => useRunCycle(), { wrapper });

        result.current.mutate();

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
