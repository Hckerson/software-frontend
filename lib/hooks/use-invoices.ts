import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { Invoice, UpcomingInvoice } from "@/lib/types";

export const useInvoices = () =>
    useQuery({
        queryKey: queryKeys.invoices,
        queryFn: () => query.get<Invoice[]>(routes.invoicesGetInvoices()),
    });

export const useInvoice = (id: string) =>
    useQuery({
        queryKey: queryKeys.invoice(id),
        queryFn: () => query.get<Invoice>(routes.invoicesGetInvoiceById(id)),
        enabled: Boolean(id),
    });

export const useUpcomingInvoice = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.upcomingInvoice,
        queryFn: () =>
            query.get<UpcomingInvoice | null>(
                routes.invoicesGetUpcomingInvoice(),
            ),
        enabled,
        retry: false,
    });

export const useMarkInvoicePaid = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            query.post<Invoice>(routes.invoicesMarkInvoicePaid(id), {}),
        onSuccess: (invoice) => {
            void client.invalidateQueries({ queryKey: queryKeys.invoices });
            void client.invalidateQueries({
                queryKey: queryKeys.invoice(invoice.id),
            });
        },
    });
};
