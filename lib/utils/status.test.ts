import { describe, expect, it } from "vitest";
import { statusTone } from "@/lib/utils/status";

describe("statusTone", () => {
    it("maps healthy states to success", () => {
        expect(statusTone("ACTIVE")).toBe("success");
        expect(statusTone("PAID")).toBe("success");
    });

    it("maps states needing attention to warning", () => {
        expect(statusTone("PAST_DUE")).toBe("warning");
        expect(statusTone("PENDING")).toBe("warning");
    });

    it("maps failure states to error", () => {
        expect(statusTone("OVERDUE")).toBe("error");
        expect(statusTone("FAILED")).toBe("error");
        expect(statusTone("SUSPENDED")).toBe("error");
    });

    it("falls back to neutral for an unknown status rather than throwing", () => {
        expect(statusTone("SOMETHING_NEW")).toBe("neutral");
    });
});
