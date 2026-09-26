import { dateFormatter } from "@/lib/utils/date-formatter";
import {
    DATE_DISPLAY_FORMAT,
    DEFAULT_CURRENCY,
    EMPTY_VALUE,
} from "@/lib/constants";

const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: DEFAULT_CURRENCY,
});

const countFormatter = new Intl.NumberFormat("en-US");

const rateFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
});

export const formatMoney = (
    amount: string | number | null | undefined,
): string => {
    if (amount === null || amount === undefined || amount === "") {
        return EMPTY_VALUE;
    }

    const value =
        typeof amount === "string" ? Number.parseFloat(amount) : amount;

    return Number.isFinite(value) ? moneyFormatter.format(value) : EMPTY_VALUE;
};

export const formatRate = (value: number | null | undefined): string =>
    value === null || value === undefined || !Number.isFinite(value)
        ? EMPTY_VALUE
        : rateFormatter.format(value);

export const formatCount = (value: number | null | undefined): string =>
    value === null || value === undefined || !Number.isFinite(value)
        ? EMPTY_VALUE
        : countFormatter.format(value);

export const formatDate = (value: string | null | undefined): string =>
    value ? dateFormatter(value, DATE_DISPLAY_FORMAT) : EMPTY_VALUE;

export const formatPeriod = (
    start: string | null | undefined,
    end: string | null | undefined,
): string => `${formatDate(start)} – ${formatDate(end)}`;

export const titleCase = (value: string): string =>
    value
        .toLowerCase()
        .split("_")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ");
