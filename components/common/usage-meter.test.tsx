import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UsageMeter from "@/components/common/usage-meter";

const meter = () => screen.getByRole("progressbar");
const fill = (container: HTMLElement) =>
    container.querySelector<HTMLElement>(".usage-meter-fill");
const article = (container: HTMLElement) =>
    container.querySelector<HTMLElement>(".usage-meter");

describe("UsageMeter", () => {
    it("exposes the metric to assistive technology as a progressbar", () => {
        render(
            <UsageMeter
                label="API calls"
                unit="calls"
                consumed={250}
                limit={1000}
            />,
        );

        expect(meter().getAttribute("aria-valuenow")).toBe("25");
        expect(meter().getAttribute("aria-valuemin")).toBe("0");
        expect(meter().getAttribute("aria-valuemax")).toBe("100");
        expect(meter().getAttribute("aria-label")).toBe("API calls");
    });

    it("states the consumed amount against the limit in words, not colour alone", () => {
        render(
            <UsageMeter
                label="API calls"
                unit="calls"
                consumed={250}
                limit={1000}
            />,
        );

        expect(screen.getByText(/250/)).toBeDefined();
        expect(screen.getByText(/1,000 calls/)).toBeDefined();
        expect(
            screen.getByText("25% of your monthly allowance used"),
        ).toBeDefined();
    });

    it("treats a null limit as unlimited rather than as zero", () => {
        const { container } = render(
            <UsageMeter
                label="Seats"
                unit="seats"
                consumed={12}
                limit={null}
            />,
        );

        expect(screen.getByText("No limit on this plan")).toBeDefined();
        expect(meter().getAttribute("aria-valuenow")).toBe("0");
        expect(article(container)?.dataset.state).toBe("normal");
    });

    it("crosses into warning at 75% and exceeded at 100%", () => {
        const { container, rerender } = render(
            <UsageMeter label="Storage" unit="GB" consumed={74} limit={100} />,
        );
        expect(article(container)?.dataset.state).toBe("normal");

        rerender(
            <UsageMeter label="Storage" unit="GB" consumed={75} limit={100} />,
        );
        expect(article(container)?.dataset.state).toBe("warning");

        rerender(
            <UsageMeter label="Storage" unit="GB" consumed={100} limit={100} />,
        );
        expect(article(container)?.dataset.state).toBe("exceeded");
    });

    it("clamps the bar at 100% when the customer is over their limit", () => {
        const { container } = render(
            <UsageMeter label="Storage" unit="GB" consumed={250} limit={100} />,
        );

        expect(fill(container)?.style.width).toBe("100%");
        expect(article(container)?.dataset.state).toBe("exceeded");
        expect(meter().getAttribute("aria-valuenow")).toBe("100");
        expect(
            screen.getByText("250% of your monthly allowance used"),
        ).toBeDefined();
    });
});
