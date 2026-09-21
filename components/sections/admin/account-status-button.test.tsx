import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AccountStatusButton from "@/components/sections/admin/account-status-button";
import { useSetAccountStatus } from "@/lib/hooks/use-admin-users";
import type { AccountUser } from "@/lib/types";

vi.mock("@/lib/hooks/use-admin-users", () => ({
    useSetAccountStatus: vi.fn(),
}));

const mutate = vi.fn();

const account = (status: AccountUser["status"]) =>
    ({ id: "u1", fullName: "Casey Jones", status }) as AccountUser;

beforeEach(() => {
    mutate.mockReset();
    vi.mocked(useSetAccountStatus).mockReturnValue({
        mutate,
        isPending: false,
        isError: false,
        error: null,
    } as never);
});

describe("AccountStatusButton", () => {
    it("offers no action on your own account, so an admin cannot lock themselves out", () => {
        render(<AccountStatusButton user={account("ACTIVE")} isSelf />);

        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.getByText("You")).toBeTruthy();
    });

    it("does not suspend until the admin confirms", () => {
        render(<AccountStatusButton user={account("ACTIVE")} isSelf={false} />);

        fireEvent.click(screen.getByRole("button", { name: "Suspend" }));

        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("suspends an active account once confirmed", () => {
        render(<AccountStatusButton user={account("ACTIVE")} isSelf={false} />);

        fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
        fireEvent.click(
            screen.getAllByRole("button", { name: "Suspend" }).at(-1)!,
        );

        expect(mutate).toHaveBeenCalledWith({ id: "u1", status: "SUSPENDED" });
    });

    it("reactivates a suspended account", () => {
        render(
            <AccountStatusButton user={account("SUSPENDED")} isSelf={false} />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Reactivate" }));
        fireEvent.click(
            screen.getAllByRole("button", { name: "Reactivate" }).at(-1)!,
        );

        expect(mutate).toHaveBeenCalledWith({ id: "u1", status: "ACTIVE" });
    });

    it("tells the admin that history survives a suspension", () => {
        render(<AccountStatusButton user={account("ACTIVE")} isSelf={false} />);

        fireEvent.click(screen.getByRole("button", { name: "Suspend" }));

        expect(screen.getByRole("dialog").textContent).toMatch(
            /invoices and history are kept/,
        );
    });
});
