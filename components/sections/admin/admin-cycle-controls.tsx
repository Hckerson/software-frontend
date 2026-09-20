"use client";
import { useState } from "react";
import SectionCard from "@/components/common/section-card";
import Button from "@/components/common/button";
import ConfirmDialog from "@/components/common/confirm-dialog";
import ErrorState from "@/components/common/error-state";
import CycleRunReport from "@/components/sections/admin/cycle-run-report";
import { CYCLE_ACTIONS } from "@/lib/data/cycle-actions";
import {
    useRenewSubscriptions,
    useRunCycle,
    useSweepOverdueInvoices,
} from "@/lib/hooks/use-cycle";
import type { CycleActionKey } from "@/lib/data/cycle-actions";

export default function AdminCycleControls() {
    const [confirming, setConfirming] = useState<CycleActionKey | null>(null);
    const run = useRunCycle();
    const renew = useRenewSubscriptions();
    const sweep = useSweepOverdueInvoices();

    const mutations = { run, renew, sweep };
    const isBusy = run.isPending || renew.isPending || sweep.isPending;
    const prompt = CYCLE_ACTIONS.find((action) => action.key === confirming);
    const failure = run.error ?? renew.error ?? sweep.error;

    const start = () => {
        if (!confirming) return;

        mutations[confirming].mutate();
        setConfirming(null);
    };

    return (
        <SectionCard
            title="Billing cycle"
            description="Renewal and the overdue sweep run here until a scheduler calls them unattended. Each job is idempotent."
            action={CYCLE_ACTIONS.map((action) => (
                <Button
                    key={action.key}
                    size="sm"
                    tone={action.key === "run" ? "accent" : "quiet"}
                    isLoading={mutations[action.key].isPending}
                    disabled={isBusy}
                    onClick={() => setConfirming(action.key)}
                >
                    {action.label}
                </Button>
            ))}
        >
            <div className="flex flex-col gap-3">
                {failure && <ErrorState error={failure} />}

                {!failure && !run.data && !renew.data && !sweep.data && (
                    <p className="text-text-secondary text-xs">
                        No cycle has been run from this console yet.
                    </p>
                )}

                {run.data && (
                    <>
                        <CycleRunReport
                            label="Renewal"
                            summary={run.data.renewal}
                        />
                        <CycleRunReport
                            label="Overdue sweep"
                            summary={run.data.overdue}
                        />
                    </>
                )}

                {renew.data && (
                    <CycleRunReport label="Renewal" summary={renew.data} />
                )}

                {sweep.data && (
                    <CycleRunReport
                        label="Overdue sweep"
                        summary={sweep.data}
                    />
                )}
            </div>

            <ConfirmDialog
                open={prompt !== undefined}
                title={prompt?.title ?? ""}
                description={prompt?.description ?? ""}
                confirmLabel={prompt?.confirmLabel ?? ""}
                isPending={isBusy}
                onConfirm={start}
                onCancel={() => setConfirming(null)}
            />
        </SectionCard>
    );
}
