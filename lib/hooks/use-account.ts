import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { UpdateUserDto } from "@/lib/contract/schemas";
import type { AccountUser } from "@/lib/types";

export const useCurrentUser = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.currentUser,
        queryFn: () => query.get<AccountUser>(routes.usersGetMe()),
        enabled,
    });

export const useUpdateAccount = (id: string | undefined) => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateUserDto) =>
            query.patch<AccountUser>(routes.usersUpdate(id ?? ""), input),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: queryKeys.currentUser }),
    });
};
