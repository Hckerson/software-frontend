import type { CreateUserDto } from "@/lib/contract/schemas";

export const emptyCreateUser: CreateUserDto = {
    fullName: "",
    email: "",
    password: "",
};
