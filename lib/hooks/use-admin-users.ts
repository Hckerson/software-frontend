import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { AccountUser, UserAccountStatus } from "@/lib/types";

interface StatusChange {
    id: string;
    status: UserAccountStatus;
}

export const useAdminUsers = () =>
    useQuery({
        queryKey: queryKeys.adminUsers,
        queryFn: () => query.get<AccountUser[]>(routes.usersFindAll()),
    });

export const useSetAccountStatus = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: StatusChange) =>
            query.patch<AccountUser>(routes.usersUpdate(id), { status }),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: queryKeys.admin }),
    });
};
