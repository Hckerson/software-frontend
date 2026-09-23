import { describe, expect, it } from "vitest";
import { activeHref } from "@/lib/utils/navigation";

const admin = ["/admin", "/admin/plans", "/admin/users"];

describe("activeHref", () => {
    it("marks the overview active on the overview itself", () => {
        expect(activeHref("/admin", admin)).toBe("/admin");
    });

    it("prefers the most specific link, so the overview is not lit on every admin page", () => {
        expect(activeHref("/admin/users", admin)).toBe("/admin/users");
    });

    it("keeps a parent lit on a child that has no link of its own", () => {
        expect(activeHref("/invoices/inv_9", ["/invoices"])).toBe("/invoices");
    });

    it("does not treat a shared prefix as a parent", () => {
        expect(activeHref("/administer", admin)).toBeUndefined();
    });

    it("marks nothing when no link matches", () => {
        expect(activeHref("/settings", admin)).toBeUndefined();
    });
});
