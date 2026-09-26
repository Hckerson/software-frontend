export type Trend = "up" | "down";

export type MeterState = "normal" | "warning" | "exceeded";

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

export type Theme = "light" | "dark";

export interface TrendPoint {
    period: string;
    amount: number;
}

export type LabelSide = "start" | "end" | null;
