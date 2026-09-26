import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { billingKeys, queryKeys } from "@/lib/hooks/query-keys";
import type { ChangePlanDto, SelectPlanDto } from "@/lib/contract/schemas";
import type { Subscription } from "@/lib/types";

export const useCurrentSubscription = () =>
    useQuery({
        queryKey: queryKeys.subscription,
        queryFn: () =>
            query.get<Subscription | null>(
                routes.subscriptionsGetCurrentSubscription(),
            ),
        retry: false,
    });

export const useSubscriptionHistory = () =>
    useQuery({
        queryKey: queryKeys.subscriptionHistory,
        queryFn: () =>
            query.get<Subscription[]>(
                routes.subscriptionsGetSubscriptionHistory(),
            ),
    });

const useInvalidateBilling = () => {
    const client = useQueryClient();

    return () => {
        for (const queryKey of billingKeys) {
            void client.invalidateQueries({ queryKey });
        }
    };
};

export const useSelectPlan = () => {
    const invalidate = useInvalidateBilling();

    return useMutation({
        mutationFn: (input: SelectPlanDto) =>
            query.post<Subscription>(routes.subscriptionsSelectPlan(), input),
        onSuccess: invalidate,
    });
};

export const useChangePlan = () => {
    const invalidate = useInvalidateBilling();

    return useMutation({
        mutationFn: (input: ChangePlanDto) =>
            query.post<Subscription>(routes.subscriptionsChangePlan(), input),
        onSuccess: invalidate,
    });
};

export const useCancelSubscription = () => {
    const invalidate = useInvalidateBilling();

    return useMutation({
        mutationFn: () =>
            query.post<Subscription>(
                routes.subscriptionsCancelSubscription(),
                {},
            ),
        onSuccess: invalidate,
    });
};

export const useReactivateSubscription = () => {
    const invalidate = useInvalidateBilling();

    return useMutation({
        mutationFn: () =>
            query.post<Subscription>(
                routes.subscriptionsReactivateSubscription(),
                {},
            ),
        onSuccess: invalidate,
    });
};
