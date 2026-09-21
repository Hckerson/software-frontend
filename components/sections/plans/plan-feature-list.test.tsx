import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlanFeatureList from "@/components/sections/plans/plan-feature-list";

const limits = { API_CALLS: 500000, STORAGE_GB: 100, SEATS: 10 };

describe("PlanFeatureList", () => {
    it("states the included allowance for each metric", () => {
        render(
            <PlanFeatureList limits={limits} overageRates={{}} features={{}} />,
        );

        expect(screen.getByText("500,000 calls")).toBeTruthy();
        expect(screen.getByText("10 seats")).toBeTruthy();
    });

    it("prices the overage for a billable metric", () => {
        render(
            <PlanFeatureList
                limits={limits}
                overageRates={{ API_CALLS: 0.0002 }}
                features={{}}
            />,
        );

        expect(
            screen.getByText("500,000 calls, then $0.0002 each"),
        ).toBeTruthy();
    });

    it("says nothing about overage for a hard-capped metric", () => {
        render(
            <PlanFeatureList
                limits={limits}
                overageRates={{ API_CALLS: 0.0002 }}
                features={{}}
            />,
        );

        expect(screen.getByText("10 seats")).toBeTruthy();
    });

    it("reports an uncapped metric as unlimited rather than billable", () => {
        render(
            <PlanFeatureList
                limits={{}}
                overageRates={{ API_CALLS: 0.0002 }}
                features={{}}
            />,
        );

        expect(screen.getByText("Unlimited calls")).toBeTruthy();
    });
});
