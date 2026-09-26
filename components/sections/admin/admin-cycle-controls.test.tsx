import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminCycleControls from "@/components/sections/admin/admin-cycle-controls";
import {
    useRenewSubscriptions,
    useRunCycle,
    useSweepOverdueInvoices,
} from "@/lib/hooks/use-cycle";

vi.mock("@/lib/hooks/use-cycle", () => ({
    useRunCycle: vi.fn(),
    useRenewSubscriptions: vi.fn(),
    useSweepOverdueInvoices: vi.fn(),
    useIssueInvoice: vi.fn(),
}));

const stub = (overrides: Record<string, unknown> = {}) => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    ...overrides,
});

const summary = (changed: number) => ({
    examined: 3,
    changed,
    skipped: 3 - changed,
    details: [],
});

let run: ReturnType<typeof stub>;

const mount = () => render(<AdminCycleControls />);

beforeEach(() => {
    run = stub();
    vi.mocked(useRunCycle).mockReturnValue(run as never);
    vi.mocked(useRenewSubscriptions).mockReturnValue(stub() as never);
    vi.mocked(useSweepOverdueInvoices).mockReturnValue(stub() as never);
});

describe("AdminCycleControls", () => {
    it("offers the cycle as an operator action rather than leaving it to curl", () => {
        mount();

        expect(
            screen.getByRole("button", { name: "Run full cycle" }),
        ).toBeTruthy();
    });

    it("does not touch billing data until the run is confirmed", () => {
        mount();

        fireEvent.click(screen.getByRole("button", { name: "Run full cycle" }));

        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(run.mutate).not.toHaveBeenCalled();
    });

    it("runs once the operator confirms", () => {
        mount();

        fireEvent.click(screen.getByRole("button", { name: "Run full cycle" }));
        fireEvent.click(screen.getByRole("button", { name: "Run cycle" }));

        expect(run.mutate).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("abandons the run when the operator cancels", () => {
        mount();

        fireEvent.click(screen.getByRole("button", { name: "Run full cycle" }));
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.queryByRole("dialog")).toBeNull();
        expect(run.mutate).not.toHaveBeenCalled();
    });

    it("reports both halves of a completed run", () => {
        vi.mocked(useRunCycle).mockReturnValue(
            stub({
                data: { renewal: summary(1), overdue: summary(2) },
            }) as never,
        );

        mount();

        expect(screen.getByText(/1 changed/)).toBeTruthy();
        expect(screen.getByText(/2 changed/)).toBeTruthy();
    });

    it("says why the cycle was refused instead of failing silently", () => {
        vi.mocked(useRunCycle).mockReturnValue(
            stub({
                isError: true,
                error: new Error("Forbidden resource"),
            }) as never,
        );

        mount();

        expect(screen.getByRole("alert")).toBeTruthy();
        expect(screen.getByText("Forbidden resource")).toBeTruthy();
    });
});
