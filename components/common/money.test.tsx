import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Money from "@/components/common/money";
import { EMPTY_VALUE } from "@/lib/constants";

describe("Money", () => {
    it("renders a Decimal-as-string amount without precision loss", () => {
        const { container } = render(<Money amount="1249.50" />);

        expect(container.textContent).toBe("$1,249.50");
    });

    it("renders a numeric amount identically to its string form", () => {
        const asString = render(<Money amount="49.00" />).container.textContent;
        const asNumber = render(<Money amount={49} />).container.textContent;

        expect(asString).toBe(asNumber);
    });

    it("falls back to the empty marker rather than showing NaN", () => {
        for (const amount of [null, undefined, "", "not-a-number"]) {
            const { container } = render(<Money amount={amount} />);

            expect(container.textContent).toBe(EMPTY_VALUE);
        }
    });

    it("appends the currency only when asked, so money is never ambiguous", () => {
        expect(render(<Money amount="49.00" />).container.textContent).toBe(
            "$49.00",
        );
        expect(
            render(<Money amount="49.00" showCurrency />).container.textContent,
        ).toBe("$49.00 USD");
    });

    it("keeps the amount on one line", () => {
        render(<Money amount="49.00" />);

        expect(screen.getByText("$49.00").className).toContain(
            "whitespace-nowrap",
        );
    });
});
