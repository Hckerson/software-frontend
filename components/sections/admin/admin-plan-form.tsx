"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import SectionCard from "@/components/common/section-card";
import ErrorState from "@/components/common/error-state";
import SelectInput from "@/components/ui/forms/select-input";
import PlanMetricFields from "@/components/sections/admin/plan-metric-fields";
import { PLAN_TYPE_OPTIONS } from "@/lib/data/plan-options";
import { toLimits, toOverageRates } from "@/lib/utils/plan-draft";
import { useCreatePlan } from "@/lib/hooks/use-plans";
import type { PlanType } from "@/lib/types";
import type { FormEvent } from "react";

export default function AdminPlanForm() {
    const create = useCreatePlan();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [planType, setPlanType] = useState<string | undefined>("PRO");
    const [limits, setLimits] = useState<Record<string, string>>({});
    const [rates, setRates] = useState<Record<string, string>>({});

    const setEntry =
        (update: typeof setLimits) => (metricType: string, value: string) =>
            update((previous) => ({ ...previous, [metricType]: value }));

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        create.mutate(
            {
                name,
                description,
                planType: (planType ?? "PRO") as PlanType,
                priceUSD: Number.parseFloat(price) || 0,
                features: {},
                limits: toLimits(limits),
                overageRates: toOverageRates(rates),
            },
            {
                onSuccess: () => {
                    setName("");
                    setDescription("");
                    setPrice("");
                    setLimits({});
                    setRates({});
                },
            },
        );
    };

    return (
        <SectionCard
            title="Create a plan"
            description="A blank limit means unlimited. A blank overage rate makes that limit a hard cap; set one to bill for the excess instead."
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <div className="form-grid">
                    <FormField
                        label="Name"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <div className="flex flex-col gap-1">
                        <span className="text-text text-xs font-semibold">
                            Tier
                        </span>
                        <SelectInput
                            label="Tier"
                            data={PLAN_TYPE_OPTIONS}
                            value={planType}
                            handleChange={setPlanType}
                        />
                    </div>
                </div>

                <FormField
                    label="Description"
                    value={description}
                    onChange={setDescription}
                    required
                />

                <FormField
                    label="Monthly price (USD)"
                    type="number"
                    value={price}
                    onChange={setPrice}
                    required
                />

                <PlanMetricFields
                    limits={limits}
                    rates={rates}
                    onLimitChange={setEntry(setLimits)}
                    onRateChange={setEntry(setRates)}
                />

                {create.isError && <ErrorState error={create.error} />}

                <div className="flex justify-end">
                    <Button type="submit" isLoading={create.isPending}>
                        Create plan
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}
