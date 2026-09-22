import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LandingPlans from "@/components/sections/landing/landing-plans";
import { usePlans } from "@/lib/hooks/use-plans";

vi.mock("@/lib/hooks/use-plans", () => ({ usePlans: vi.fn() }));

const plan = {
    id: "plan-growth",
    name: "Growth",
    description: null,
    priceUSD: "49.00",
    planType: "PRO",
    features: {},
    limits: {},
    overageRates: {},
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
};

const query = (overrides: Record<string, unknown>) => ({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
});

beforeEach(() => {
    vi.mocked(usePlans).mockReset();
});

describe("LandingPlans", () => {
    it("keeps the pricing section and offers a retry when plans fail to load", () => {
        const failed = query({
            isError: true,
            error: new Error("Network Error"),
        });
        vi.mocked(usePlans).mockReturnValue(failed as never);

        render(<LandingPlans />);

        expect(screen.getByText("Simple, metered pricing")).toBeTruthy();
        expect(screen.getByRole("alert").textContent).toContain(
            "Network Error",
        );

        fireEvent.click(screen.getByRole("button", { name: "Try again" }));
        expect(failed.refetch).toHaveBeenCalledTimes(1);
    });

    it("renders the active plans once they load", () => {
        vi.mocked(usePlans).mockReturnValue(
            query({
                data: [
                    plan,
                    { ...plan, id: "old", name: "Legacy", isActive: false },
                ],
            }) as never,
        );

        render(<LandingPlans />);

        expect(screen.getByText("Growth")).toBeTruthy();
        expect(screen.queryByText("Legacy")).toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("renders nothing for an empty catalogue, which is a deployment fault", () => {
        vi.mocked(usePlans).mockReturnValue(query({ data: [] }) as never);

        const { container } = render(<LandingPlans />);

        expect(container.firstChild).toBeNull();
    });
});
