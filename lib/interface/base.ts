import { TransactionStatus } from "../enums/enums";
import { Trend } from "../types/types";

export interface BaseChartData {
    trend: Trend;
    change: number;
    currentFigure: number;
}

export interface BaseFinance {
    id: string;
    amount: number;
    status: TransactionStatus;
}

export interface BaseImage {
    imageSrc?: string;
}

export interface BaseLocation {
    state: string;
    country: string;
}

export interface BaseUser {
    id: string;
    email: string;
    avatar?: string;
    fullName: string;
}

export interface User extends BaseUser {
    role?: string;
}

export type MetricSkeleton<T extends string | number | symbol> = {
    [K in T]: BaseChartData;
};
