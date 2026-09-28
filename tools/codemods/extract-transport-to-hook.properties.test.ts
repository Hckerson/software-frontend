import fc from "fast-check";
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

type CallShape =
    "literal" | "configAll" | "configDetail" | "routeAll" | "routeDetail";

type Method = "get" | "post";

interface CallSpec {
    method: Method;
    shape: CallShape;
    resource: string;
}

interface FileSpec {
    calls: CallSpec[];
    decoyKey: boolean;
}

const COMPONENT = "/components/common/screen.tsx";

const RESOURCES = ["users", "posts", "orders"];

const RUNS = { numRuns: 50 };

const TIMEOUT = 120_000;

const urlExpression = ({ shape, resource }: CallSpec): string => {
    switch (shape) {
        case "literal":
            return `"/${resource}"`;
        case "configAll":
            return `config.api.${resource}.all`;
        case "configDetail":
            return `config.api.${resource}.detail(id)`;
        case "routeAll":
            return `routes.${resource}FindAll()`;
        case "routeDetail":
            return `routes.${resource}FindOne(id)`;
    }
};

const callExpression = (call: CallSpec): string =>
    call.method === "get"
        ? `query.get(${urlExpression(call)})`
        : `query.post(${urlExpression(call)}, {})`;

const routeEntries = (resource: string): string[] => [
    `${resource}FindAll: () => "/api/${resource}"`,
    `${resource}FindOne: (id: string) => "/api/${resource}/" + id`,
];

const configEntry = (resource: string): string =>
    `${resource}: { all: "/${resource}", detail: (id: string) => "/${resource}/" + id }`;

const componentSource = (spec: FileSpec): string => {
    const decoy = spec.decoyKey
        ? ["    const options = { query: 1, config: 2, routes: 3 };"]
        : [];

    const bindings = spec.calls.map(
        (call, index) => `    const value${index} = ${callExpression(call)};`,
    );

    const returned = [
        ...spec.calls.map((_, index) => `value${index}`),
        ...(spec.decoyKey ? ["options"] : []),
    ].join(", ");

    return [
        'import { query } from "@/lib/api-client";',
        'import { config } from "@/lib/api-routes";',
        'import { routes } from "@/lib/contract/routes";',
        "",
        "export function Screen({ id }: { id: string }) {",
        ...decoy,
        ...bindings,
        `    return [${returned}];`,
        "}",
    ].join("\n");
};

const createSupportProject = (): Project => {
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
            get: (url: string, config?: unknown) => ({ url, config }),
            post: (url: string, body: unknown) => ({ url, body }),
        };`,
    );

    project.createSourceFile(
        "/lib/api-routes.ts",
        `export const config = { api: { ${RESOURCES.map(configEntry).join(", ")} } };`,
    );

    project.createSourceFile(
        "/lib/contract/routes.ts",
        `export const routes = { ${RESOURCES.flatMap(routeEntries).join(", ")} };`,
    );

    return project;
};

const project = createSupportProject();

const SUPPORT_PATHS = project
    .getSourceFiles()
    .map((file) => file.getFilePath().toString());

interface Run {
    project: Project;
    root: string;
    componentPath: string;
}

let runIndex = 0;

const startRun = (spec: FileSpec): Run => {
    for (const file of project.getSourceFiles()) {
        if (!SUPPORT_PATHS.includes(file.getFilePath().toString())) {
            project.removeSourceFile(file);
        }
    }

    const root = `/run-${(runIndex += 1)}`;
    const componentPath = `${root}${COMPONENT}`;

    project.createSourceFile(componentPath, componentSource(spec));

    return { project, root, componentPath };
};

const textOf = (project: Project): Record<string, string> =>
    Object.fromEntries(
        project
            .getSourceFiles()
            .map((file) => [file.getFilePath().toString(), file.getFullText()]),
    );

const fileSpec: fc.Arbitrary<FileSpec> = fc.record({
    calls: fc.array(
        fc.record({
            method: fc.constantFrom<Method>("get", "post"),
            shape: fc.constantFrom<CallShape>(
                "literal",
                "configAll",
                "configDetail",
                "routeAll",
                "routeDetail",
            ),
            resource: fc.constantFrom(...RESOURCES),
        }),
        { minLength: 1, maxLength: 4 },
    ),
    decoyKey: fc.boolean(),
});

describe("extract-transport-to-hook properties", () => {
    it(
        "accounts for every transport call as extracted or skipped",
        () => {
            fc.assert(
                fc.property(fileSpec, (spec) => {
                    const run = startRun(spec);
                    const plan = planExtraction(run.project, run.root);

                    expect(plan.extractions.length + plan.skips.length).toBe(
                        spec.calls.length,
                    );
                }),
                RUNS,
            );
        },
        TIMEOUT,
    );

    it(
        "leaves the tree byte-identical when nothing is extractable",
        () => {
            fc.assert(
                fc.property(fileSpec, (spec) => {
                    const run = startRun(spec);
                    const plan = planExtraction(run.project, run.root);

                    fc.pre(plan.extractions.length === 0);

                    const before = textOf(run.project);
                    applyExtraction(run.project, plan);

                    expect(textOf(run.project)).toEqual(before);
                }),
                RUNS,
            );
        },
        TIMEOUT,
    );

    it(
        "is idempotent - a second run finds nothing left to extract",
        () => {
            fc.assert(
                fc.property(fileSpec, (spec) => {
                    const run = startRun(spec);
                    applyExtraction(
                        run.project,
                        planExtraction(run.project, run.root),
                    );

                    const after = textOf(run.project);
                    const second = planExtraction(run.project, run.root);

                    expect(second.extractions).toEqual([]);

                    applyExtraction(run.project, second);
                    expect(textOf(run.project)).toEqual(after);
                }),
                RUNS,
            );
        },
        TIMEOUT,
    );

    it(
        "drops the transport import once every call in the file is extracted",
        () => {
            fc.assert(
                fc.property(fileSpec, (spec) => {
                    const run = startRun(spec);
                    const plan = planExtraction(run.project, run.root);

                    fc.pre(plan.skips.length === 0);
                    fc.pre(plan.extractions.length > 0);

                    applyExtraction(run.project, plan);

                    expect(
                        run.project
                            .getSourceFileOrThrow(run.componentPath)
                            .getFullText(),
                    ).not.toContain("@/lib/api-client");
                }),
                RUNS,
            );
        },
        TIMEOUT,
    );
});
