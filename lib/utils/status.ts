import type { StatusTone } from "@/lib/types";

const TONES: Record<string, StatusTone> = {
    ACTIVE: "success",
    PAID: "success",
    SENT: "info",
    PENDING: "warning",
    PAST_DUE: "warning",
    DRAFT: "neutral",
    CANCELED: "neutral",
    SUSPENDED: "error",
    FAILED: "error",
    OVERDUE: "error",
};

export const statusTone = (status: string): StatusTone =>
    TONES[status] ?? "neutral";
