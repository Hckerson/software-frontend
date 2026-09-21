import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConfirmDialog from "@/components/common/confirm-dialog";

const props = {
    title: "Cancel subscription",
    description: "Your plan stays active until the end of the period.",
    confirmLabel: "Cancel plan",
};

describe("ConfirmDialog", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders nothing while closed, so destructive actions need a second step", () => {
        const { container } = render(
            <ConfirmDialog
                {...props}
                open={false}
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    it("announces itself as a modal dialog labelled by its title", () => {
        render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        const dialog = screen.getByRole("dialog");

        expect(dialog.getAttribute("aria-modal")).toBe("true");
        expect(dialog.getAttribute("aria-label")).toBe(props.title);
    });

    it("moves focus to the confirm button when it opens", () => {
        render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        expect(document.activeElement).toBe(
            screen.getByRole("button", { name: props.confirmLabel }),
        );
    });

    it("restores focus to the trigger when it closes", () => {
        const trigger = document.createElement("button");
        document.body.appendChild(trigger);
        trigger.focus();

        const { rerender } = render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        expect(document.activeElement).not.toBe(trigger);

        rerender(
            <ConfirmDialog
                {...props}
                open={false}
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        expect(document.activeElement).toBe(trigger);
    });

    it("keeps focus where the user put it when the parent re-renders", () => {
        const { rerender } = render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={() => undefined}
            />,
        );
        const cancel = screen.getByRole("button", { name: "Cancel" });
        cancel.focus();

        rerender(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={() => undefined}
            />,
        );

        expect(document.activeElement).toBe(cancel);
    });

    it("closes on Escape", () => {
        const onCancel = vi.fn();
        render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );

        fireEvent.keyDown(window, { key: "Escape" });

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("ignores Escape once closed, so the handler is torn down", () => {
        const onCancel = vi.fn();
        const { rerender } = render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );

        rerender(
            <ConfirmDialog
                {...props}
                open={false}
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );
        fireEvent.keyDown(window, { key: "Escape" });

        expect(onCancel).not.toHaveBeenCalled();
    });

    it("reports the confirm choice separately from the cancel choice", () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        render(
            <ConfirmDialog
                {...props}
                open
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: props.confirmLabel }),
        );
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("disables both choices while the mutation is in flight", () => {
        render(
            <ConfirmDialog
                {...props}
                open
                isPending
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        for (const button of screen.getAllByRole("button")) {
            expect(button).toHaveProperty("disabled", true);
        }
    });
});
