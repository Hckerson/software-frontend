"use client";
import { useState } from "react";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import SectionCard from "@/components/common/section-card";
import ErrorState from "@/components/common/error-state";
import SelectInput from "@/components/ui/forms/select-input";
import { METRIC_DESCRIPTORS } from "@/lib/data/metrics";
import { PLAN_TYPE_OPTIONS } from "@/lib/data/plan-options";
import { useCreatePlan } from "@/lib/hooks/use-plans";
import type { PlanLimits, PlanType } from "@/lib/types";
import type { FormEvent } from "react";

const toLimits = (draft: Record<string, string>): PlanLimits => {
    const limits: PlanLimits = {};

    for (const descriptor of METRIC_DESCRIPTORS) {
        const raw = Number.parseInt(draft[descriptor.metricType] ?? "", 10);

        if (Number.isFinite(raw) && raw > 0) {
            limits[descriptor.metricType] = raw;
        }
    }

    return limits;
};

export default function AdminPlanForm() {
    const create = useCreatePlan();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [planType, setPlanType] = useState<string | undefined>("PRO");
    const [limits, setLimits] = useState<Record<string, string>>({});

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
            },
            {
                onSuccess: () => {
                    setName("");
                    setDescription("");
                    setPrice("");
                    setLimits({});
                },
            },
        );
    };

    return (
        <SectionCard
            title="Create a plan"
            description="Leave a limit blank to make that metric unlimited."
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

                <div className="form-grid">
                    {METRIC_DESCRIPTORS.map((descriptor) => (
                        <FormField
                            key={descriptor.metricType}
                            label={`${descriptor.label} limit`}
                            type="number"
                            value={limits[descriptor.metricType] ?? ""}
                            onChange={(value) =>
                                setLimits((previous) => ({
                                    ...previous,
                                    [descriptor.metricType]: value,
                                }))
                            }
                        />
                    ))}
                </div>

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
