import { useMutation, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { CycleRunAll, CycleRunSummary, Invoice } from "@/lib/types";

const useInvalidateAdmin = () => {
    const client = useQueryClient();

    return () => client.invalidateQueries({ queryKey: queryKeys.admin });
};

export const useRunCycle = () => {
    const invalidate = useInvalidateAdmin();

    return useMutation({
        mutationFn: () => query.post<CycleRunAll>(routes.cycleRunAll(), {}),
        onSuccess: invalidate,
    });
};

export const useRenewSubscriptions = () => {
    const invalidate = useInvalidateAdmin();

    return useMutation({
        mutationFn: () => query.post<CycleRunSummary>(routes.cycleRenew(), {}),
        onSuccess: invalidate,
    });
};

export const useSweepOverdueInvoices = () => {
    const invalidate = useInvalidateAdmin();

    return useMutation({
        mutationFn: () =>
            query.post<CycleRunSummary>(routes.cycleSweepOverdue(), {}),
        onSuccess: invalidate,
    });
};

export const useIssueInvoice = () => {
    const invalidate = useInvalidateAdmin();

    return useMutation({
        mutationFn: (id: string) =>
            query.post<Invoice>(routes.cycleIssueInvoice(id), {}),
        onSuccess: invalidate,
    });
};
