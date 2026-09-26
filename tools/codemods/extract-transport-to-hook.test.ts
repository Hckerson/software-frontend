import { describe, expect, it } from "vitest";
import {
    ModuleKind,
    ModuleResolutionKind,
    Project,
    ScriptTarget,
    ts,
} from "ts-morph";
import { planExtraction } from "./plan-extraction";
import { applyExtraction } from "./apply-extraction";

const createProject = (files: Record<string, string>): Project => {
    const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: {
            baseUrl: "/",
            paths: { "@/*": ["/*"] },
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            moduleResolution: ModuleResolutionKind.Bundler,
            jsx: ts.JsxEmit.ReactJSX,
            strict: true,
        },
    });

    project.createSourceFile(
        "/lib/api-client.ts",
        `export const query = {
            get: (url: string, body?: unknown) => ({ url, body }),
            post: (url: string, body: unknown) => ({ url, body }),
        };`,
    );

    project.createSourceFile(
        "/lib/api-routes.ts",
        `export const config = {
            api: { users: { all: "/users", detail: (id: string) => "/users/" + id } },
        };`,
    );

    for (const [path, content] of Object.entries(files)) {
        project.createSourceFile(path, content);
    }

    return project;
};

describe("extract-transport-to-hook", () => {
    it("extracts a parameterless GET into a hook and rewrites the call site", () => {
        const project = createProject({
            "/components/common/user-list.tsx": `
                import { query } from "@/lib/api-client";
                import { config } from "@/lib/api-routes";

                export function UserList() {
                    return query.get(config.api.users.all);
                }
            `,
        });

        const plan = planExtraction(project, "");

        expect(plan.skips).toEqual([]);
        expect(plan.extractions).toHaveLength(1);
        expect(plan.extractions[0].name).toBe("useUsers");
        expect(plan.extractions[0].hookPath).toBe("/lib/hooks/use-users.ts");

        applyExtraction(project, plan);

        const hook = project.getSourceFileOrThrow("/lib/hooks/use-users.ts");
        expect(hook.getFullText()).toContain(
            "queryFn: () => query.get(config.api.users.all)",
        );
        expect(hook.getFullText()).toContain(
            'import { query } from "@/lib/api-client"',
        );
        expect(hook.getFullText()).toContain('queryKey: ["users"]');

        const component = project
            .getSourceFileOrThrow("/components/common/user-list.tsx")
            .getFullText();
        expect(component).toContain("return useUsers();");
        expect(component).toContain('from "@/lib/hooks/use-users"');
        expect(component).not.toContain("@/lib/api-client");
        expect(component).not.toContain("@/lib/api-routes");
    });

    it("threads a primitive local value through as a hook parameter", () => {
        const project = createProject({
            "/components/common/user-card.tsx": `
                import { query } from "@/lib/api-client";
                import { config } from "@/lib/api-routes";

                export function UserCard({ id }: { id: string }) {
                    return query.get(config.api.users.detail(id));
                }
            `,
        });

        const plan = planExtraction(project, "");

        expect(plan.extractions[0].parameters).toEqual([
            { name: "id", type: "string" },
        ]);

        applyExtraction(project, plan);

        const hook = project
            .getSourceFileOrThrow("/lib/hooks/use-users.ts")
            .getFullText();
        expect(hook).toContain("export const useUsers = (id: string) =>");
        expect(hook).toContain('queryKey: ["users", id]');

        expect(
            project
                .getSourceFileOrThrow("/components/common/user-card.tsx")
                .getFullText(),
        ).toContain("return useUsers(id);");
    });

    it("skips non-GET calls instead of guessing mutation semantics", () => {
        const project = createProject({
            "/components/common/login-form.tsx": `
                import { query } from "@/lib/api-client";

                export function LoginForm() {
                    return query.post("/auth/login", {});
                }
            `,
        });

        const plan = planExtraction(project, "");

        expect(plan.extractions).toEqual([]);
        expect(plan.skips[0].reason).toContain("non-GET");
    });

    it("skips calls whose arguments depend on non-primitive local values", () => {
        const project = createProject({
            "/components/common/user-table.tsx": `
                import { query } from "@/lib/api-client";
                import { config } from "@/lib/api-routes";

                export function UserTable() {
                    const filters = { active: true };
                    return query.get(config.api.users.all, filters);
                }
            `,
        });

        const plan = planExtraction(project, "");

        expect(plan.extractions).toEqual([]);
        expect(plan.skips[0].reason).toContain("filters");
    });

    it("leaves existing hooks alone", () => {
        const project = createProject({
            "/lib/hooks/use-users.ts": `
                import { query } from "@/lib/api-client";
                import { config } from "@/lib/api-routes";

                export const useUsers = () => query.get(config.api.users.all);
            `,
        });

        expect(planExtraction(project, "")).toEqual({
            extractions: [],
            skips: [],
        });
    });
});
