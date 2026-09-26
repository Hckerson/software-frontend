import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { CreatePaymentMethodDto } from "@/lib/contract/schemas";
import type { PaymentMethod } from "@/lib/types";

export const usePaymentMethods = () =>
    useQuery({
        queryKey: queryKeys.paymentMethods,
        queryFn: () => query.get<PaymentMethod[]>(routes.paymentMethodsList()),
    });

const useInvalidatePaymentMethods = () => {
    const client = useQueryClient();

    return () =>
        client.invalidateQueries({ queryKey: queryKeys.paymentMethods });
};

export const useAddPaymentMethod = () => {
    const invalidate = useInvalidatePaymentMethods();

    return useMutation({
        mutationFn: (input: CreatePaymentMethodDto) =>
            query.post<PaymentMethod>(routes.paymentMethodsAdd(), input),
        onSuccess: invalidate,
    });
};

export const useSetDefaultPaymentMethod = () => {
    const invalidate = useInvalidatePaymentMethods();

    return useMutation({
        mutationFn: (id: string) =>
            query.patch<PaymentMethod>(routes.paymentMethodsSetDefault(id), {}),
        onSuccess: invalidate,
    });
};

export const useRemovePaymentMethod = () => {
    const invalidate = useInvalidatePaymentMethods();

    return useMutation({
        mutationFn: (id: string) =>
            query.delete<PaymentMethod>(routes.paymentMethodsRemove(id)),
        onSuccess: invalidate,
    });
};
