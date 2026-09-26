import { titleCase } from "@/lib/utils/format";
import type { PlanType } from "@/lib/types";

export interface PlanTypeOption {
    label: string;
    value: string | undefined;
}

const PLAN_TYPES: PlanType[] = ["FREE", "PRO", "ENTERPRISE"];

export const PLAN_TYPE_OPTIONS: PlanTypeOption[] = PLAN_TYPES.map((value) => ({
    label: titleCase(value),
    value,
}));
