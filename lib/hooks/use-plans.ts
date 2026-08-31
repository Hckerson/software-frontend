import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { CreatePlanDto, UpdatePlanDto } from "@/lib/contract/schemas";
import type { SubscriptionPlan } from "@/lib/types";

export const usePlans = () =>
    useQuery({
        queryKey: queryKeys.plans,
        queryFn: () => query.get<SubscriptionPlan[]>(routes.plansGetAllPlans()),
    });

export const usePlan = (id: string) =>
    useQuery({
        queryKey: queryKeys.plan(id),
        queryFn: () => query.get<SubscriptionPlan>(routes.plansGetPlanById(id)),
        enabled: Boolean(id),
    });

const useInvalidatePlans = () => {
    const client = useQueryClient();

    return () => client.invalidateQueries({ queryKey: queryKeys.plans });
};

export const useCreatePlan = () => {
    const invalidate = useInvalidatePlans();

    return useMutation({
        mutationFn: (input: CreatePlanDto) =>
            query.post<SubscriptionPlan>(routes.plansCreatePlan(), input),
        onSuccess: invalidate,
    });
};

export const useUpdatePlan = () => {
    const invalidate = useInvalidatePlans();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdatePlanDto }) =>
            query.patch<SubscriptionPlan>(routes.plansUpdatePlan(id), input),
        onSuccess: invalidate,
    });
};

export const useSetPlanActive = () => {
    const invalidate = useInvalidatePlans();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            query.patch<SubscriptionPlan>(
                isActive
                    ? routes.plansActivatePlan(id)
                    : routes.plansDeactivatePlan(id),
                {},
            ),
        onSuccess: invalidate,
    });
};

export const useDeletePlan = () => {
    const invalidate = useInvalidatePlans();

    return useMutation({
        mutationFn: (id: string) =>
            query.delete<void>(routes.plansDeletePlan(id)),
        onSuccess: invalidate,
    });
};
