"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import SelectInput from "@/components/ui/forms/select-input";
import PlanMetricFields from "@/components/sections/admin/plan-metric-fields";
import { PLAN_TYPE_OPTIONS } from "@/lib/data/plan-options";
import { toDraft, toLimits, toOverageRates } from "@/lib/utils/plan-draft";
import { useUpdatePlan } from "@/lib/hooks/use-plans";
import type { PlanType, SubscriptionPlan } from "@/lib/types";
import type { FormEvent } from "react";

interface Props {
    plan: SubscriptionPlan;
    onClose: () => void;
}

export default function AdminPlanEdit({ plan, onClose }: Props) {
    const update = useUpdatePlan();
    const panelRef = useRef<HTMLFormElement>(null);
    const [name, setName] = useState(plan.name);
    const [description, setDescription] = useState(plan.description ?? "");
    const [price, setPrice] = useState(plan.priceUSD);
    const [planType, setPlanType] = useState<string | undefined>(plan.planType);
    const [limits, setLimits] = useState(toDraft(plan.limits));
    const [rates, setRates] = useState(toDraft(plan.overageRates));

    useEffect(() => {
        panelRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const setEntry =
        (apply: typeof setLimits) => (metricType: string, value: string) =>
            apply((previous) => ({ ...previous, [metricType]: value }));

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        update.mutate(
            {
                id: plan.id,
                input: {
                    name,
                    description,
                    planType: (planType ?? plan.planType) as PlanType,
                    priceUSD: Number.parseFloat(price) || 0,
                    limits: toLimits(limits),
                    overageRates: toOverageRates(rates),
                },
            },
            { onSuccess: onClose },
        );
    };

    return (
        <div
            className="dialog-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${plan.name}`}
        >
            <form
                ref={panelRef}
                tabIndex={-1}
                onSubmit={onSubmit}
                className="dialog-panel dialog-panel--wide"
            >
                <h2 className="text-text font-display text-h6">
                    Edit {plan.name}
                </h2>
                <p className="text-text-secondary text-sm">
                    Subscriptions already on this plan keep their current terms
                    until they renew.
                </p>

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

                {update.isError && <ErrorState error={update.error} />}

                <footer className="flex justify-end gap-2">
                    <Button
                        tone="quiet"
                        onClick={onClose}
                        disabled={update.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={update.isPending}>
                        Save changes
                    </Button>
                </footer>
            </form>
        </div>
    );
}
