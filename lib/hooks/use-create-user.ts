import { useMutation } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import {
    createUserDtoSchema,
    type CreateUserDto,
} from "@/lib/contract/schemas";

export const useCreateUser = () =>
    useMutation({
        mutationFn: (input: CreateUserDto) =>
            query.post(routes.usersCreate(), createUserDtoSchema.parse(input)),
    });
