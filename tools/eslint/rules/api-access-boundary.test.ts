import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { apiAccessBoundary } from "./api-access-boundary";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("api-access-boundary", apiAccessBoundary, {
    valid: [
        {
            name: "function declaration hook in the hooks directory",
            filename: "lib/hooks/use-users.ts",
            code: `
                import { query } from "@/lib/api-client";
                export function useUsers() {
                    return query.get("/users");
                }
            `,
        },
        {
            name: "arrow hook with the call nested in a callback",
            filename: "lib/hooks/use-users.ts",
            code: `
                import { query } from "@/lib/api-client";
                import { useQuery } from "@tanstack/react-query";
                export const useUsers = () =>
                    useQuery({
                        queryKey: ["users"],
                        queryFn: () => query.get("/users"),
                    });
            `,
        },
        {
            name: "namespace import used inside a hook",
            filename: "lib/hooks/use-users.ts",
            code: `
                import * as api from "@/lib/api-client";
                export function useUsers() {
                    return api.query.get("/users");
                }
            `,
        },
        {
            name: "aliased import used inside a hook",
            filename: "lib/hooks/use-users.ts",
            code: `
                import { query as transport } from "@/lib/api-client";
                export function useUsers() {
                    return transport.post("/users", {});
                }
            `,
        },
        {
            name: "unrelated local object that happens to be named query",
            filename: "components/common/user-list.tsx",
            code: `
                const query = { get: (url: string) => url };
                export function UserList() {
                    return query.get("/users");
                }
            `,
        },
        {
            name: "windows-style absolute path inside the hooks directory",
            filename: "C:\\project\\lib\\hooks\\use-users.ts",
            code: `
                import { query } from "@/lib/api-client";
                export function useUsers() {
                    return query.get("/users");
                }
            `,
        },
    ],
    invalid: [
        {
            name: "module-level call in a hooks file",
            filename: "lib/hooks/use-users.ts",
            code: `
                import { query } from "@/lib/api-client";
                export const users = query.get("/users");
            `,
            errors: [{ messageId: "outsideHookFunction" }],
        },
        {
            name: "non-hook helper in a hooks file",
            filename: "lib/hooks/use-users.ts",
            code: `
                import { query } from "@/lib/api-client";
                function fetchUsers() {
                    return query.get("/users");
                }
                export function useUsers() {
                    return fetchUsers();
                }
            `,
            errors: [{ messageId: "outsideHookFunction" }],
        },
        {
            name: "component calling the transport layer directly",
            filename: "components/common/user-list.tsx",
            code: `
                import { query } from "@/lib/api-client";
                export function UserList() {
                    query.get("/users");
                    return null;
                }
            `,
            errors: [{ messageId: "outsideHooksDir" }],
        },
        {
            name: "server component page calling the axios instance",
            filename: "app/page.tsx",
            code: `
                import { apiClient } from "@/lib/api-client";
                export default async function Page() {
                    await apiClient.request({ url: "/users" });
                    return null;
                }
            `,
            errors: [{ messageId: "outsideHooksDir" }],
        },
        {
            name: "hook-named function outside the hooks directory",
            filename: "components/common/user-list.tsx",
            code: `
                import { query } from "@/lib/api-client";
                export function useUsers() {
                    return query.get("/users");
                }
            `,
            errors: [{ messageId: "outsideHooksDir" }],
        },
    ],
});
