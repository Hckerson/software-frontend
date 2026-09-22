import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UsageTrendChart from "@/components/sections/usage/usage-trend-chart";

const points = [
    { period: "2026-07", amount: 310000 },
    { period: "2026-08", amount: 455000 },
    { period: "2026-09", amount: 412500 },
];

const renderChart = (limit?: number | null) =>
    render(
        <UsageTrendChart
            label="API calls"
            unit="calls"
            points={points}
            limit={limit}
        />,
    );

describe("UsageTrendChart", () => {
    it("draws one column per period", () => {
        const { container } = renderChart(500000);

        expect(container.querySelectorAll(".trend-bar")).toHaveLength(3);
    });

    it("makes every period reachable by keyboard with a spoken value", () => {
        renderChart(500000);

        const targets = screen.getAllByRole("img");

        expect(targets).toHaveLength(3);
        expect(targets[2].getAttribute("tabindex")).toBe("0");
        expect(targets[2].getAttribute("aria-label")).toBe(
            "Sep 2026: 412,500 calls, 83% of the limit",
        );
    });

    it("shows the same readout on focus as on hover", () => {
        renderChart(500000);

        fireEvent.focus(screen.getAllByRole("img")[1]);
        expect(screen.getByText("455,000 calls")).toBeTruthy();

        fireEvent.blur(screen.getAllByRole("img")[1]);
        expect(screen.queryByText("455,000 calls")).toBeNull();
    });

    it("draws and labels the plan limit", () => {
        const { container } = renderChart(500000);

        expect(container.querySelector(".trend-limit")).not.toBeNull();
        expect(screen.getByText("Limit 500K")).toBeTruthy();
    });

    it("labels only the latest value, not every column", () => {
        const { container } = renderChart(500000);

        expect(container.querySelectorAll(".trend-value")).toHaveLength(1);
        expect(container.querySelector(".trend-value")?.textContent).toBe(
            "412.5K",
        );
    });

    it("says unlimited only when the plan really is unlimited", () => {
        const { container } = renderChart(null);

        expect(screen.getByText(/unlimited on your plan/)).toBeTruthy();
        expect(container.querySelector(".trend-limit")).toBeNull();
    });

    it("claims nothing about the limit while the plan is still loading", () => {
        const { container } = renderChart(undefined);

        expect(screen.queryByText(/unlimited/)).toBeNull();
        expect(container.querySelector(".trend-limit")).toBeNull();
    });
});
