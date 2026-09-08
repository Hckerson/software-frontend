import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusPill from "@/components/common/status-pill";

describe("StatusPill", () => {
    it("always names the status in words, never colour alone", () => {
        render(<StatusPill status="PAST_DUE" />);

        expect(screen.getByText("Past Due")).toBeDefined();
    });

    it("maps each billing status onto its tone class", () => {
        const cases: [string, string][] = [
            ["ACTIVE", "status-pill--success"],
            ["PAID", "status-pill--success"],
            ["SENT", "status-pill--info"],
            ["PAST_DUE", "status-pill--warning"],
            ["OVERDUE", "status-pill--error"],
        ];

        for (const [status, tone] of cases) {
            const { container } = render(<StatusPill status={status} />);
            const pill = container.querySelector(".status-pill");

            expect(pill?.className).toContain(tone);
        }
    });

    it("renders a neutral pill for an unknown status instead of failing", () => {
        const { container } = render(<StatusPill status="SOMETHING_NEW" />);
        const pill = container.querySelector(".status-pill");

        expect(screen.getByText("Something New")).toBeDefined();
        expect(pill?.className).not.toMatch(/status-pill--/);
    });

    it("keeps the named class when a caller adds its own", () => {
        const { container } = render(
            <StatusPill status="ACTIVE" className="ml-2" />,
        );
        const pill = container.querySelector(".status-pill");

        expect(pill?.className).toContain("status-pill--success");
        expect(pill?.className).toContain("ml-2");
    });
});
