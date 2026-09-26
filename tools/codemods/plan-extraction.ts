import {
    CallExpression,
    Identifier,
    Node,
    Project,
    SourceFile,
    SyntaxKind,
} from "ts-morph";
import {
    HOOKS_DIR,
    READ_METHOD,
    enclosingFunction,
    findTransportCalls,
    isWithinHooksDir,
    referencedIdentifiers,
    rootIdentifier,
    transportMethod,
} from "./transport-calls";
import { deriveResource, hookFileName, hookName } from "./hook-naming";

export type CopiedImport = {
    moduleSpecifier: string;
    local: string;
    imported?: string;
    namespace: boolean;
};

export type HookParameter = { name: string; type: string };

export type Extraction = {
    file: SourceFile;
    call: CallExpression;
    resource: string;
    name: string;
    hookPath: string;
    parameters: HookParameter[];
    imports: CopiedImport[];
};

export type Skip = { filePath: string; line: number; reason: string };

export type Plan = { extractions: Extraction[]; skips: Skip[] };

const PRIMITIVE_TYPES = ["string", "number", "boolean"];

const asCopiedImport = (identifier: Identifier): CopiedImport | undefined => {
    const declaration = identifier.getSymbol()?.getDeclarations().at(0);
    const moduleSpecifier = declaration
        ?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
        ?.getModuleSpecifierValue();

    if (!declaration || !moduleSpecifier) return undefined;

    if (Node.isImportSpecifier(declaration)) {
        return {
            moduleSpecifier,
            local: identifier.getText(),
            imported: declaration.getName(),
            namespace: false,
        };
    }

    return {
        moduleSpecifier,
        local: identifier.getText(),
        namespace: Node.isNamespaceImport(declaration),
    };
};

const asParameter = (
    identifier: Identifier,
    scope: Node,
): HookParameter | undefined => {
    const declaration = identifier.getSymbol()?.getDeclarations().at(0);

    if (!declaration || !declaration.getFirstAncestor((n) => n === scope)) {
        return undefined;
    }

    const type = identifier.getType().getBaseTypeOfLiteralType().getText();

    return PRIMITIVE_TYPES.includes(type)
        ? { name: identifier.getText(), type }
        : undefined;
};

const planCall = (
    call: CallExpression,
    rootPath: string,
    taken: Set<string>,
): Extraction | string => {
    if (transportMethod(call) !== READ_METHOD) {
        return "non-GET call needs explicit mutation semantics (cache keys, invalidation)";
    }

    const scope = enclosingFunction(call);
    if (!scope)
        return "call sits at module scope, so it cannot become a hook call";

    const root = rootIdentifier(call.getExpression());
    const transport = root ? asCopiedImport(root) : undefined;

    if (!transport)
        return "transport binding could not be resolved to an import";

    const imports: CopiedImport[] = [transport];
    const parameters: HookParameter[] = [];

    for (const identifier of referencedIdentifiers(call)) {
        const copied = asCopiedImport(identifier);

        if (copied) {
            imports.push(copied);
            continue;
        }

        const parameter = asParameter(identifier, scope);

        if (!parameter) {
            return `argument '${identifier.getText()}' is neither imported nor a primitive local value`;
        }

        if (!parameters.some((existing) => existing.name === parameter.name)) {
            parameters.push(parameter);
        }
    }

    const resource = deriveResource(call.getArguments().at(0), "resource");
    const hookPath = `${rootPath}/${HOOKS_DIR}/${hookFileName(resource)}`;

    if (taken.has(hookPath)) {
        return `a hook file for '${resource}' already exists at ${hookPath}`;
    }

    return {
        file: call.getSourceFile(),
        call,
        resource,
        name: hookName(resource),
        hookPath,
        parameters,
        imports,
    };
};

export const planExtraction = (project: Project, rootPath: string): Plan => {
    const extractions: Extraction[] = [];
    const skips: Skip[] = [];
    const taken = new Set(
        project.getSourceFiles().map((file) => file.getFilePath().toString()),
    );

    for (const file of project.getSourceFiles()) {
        if (isWithinHooksDir(file.getFilePath())) continue;

        for (const call of findTransportCalls(file)) {
            const result = planCall(call, rootPath, taken);

            if (typeof result === "string") {
                skips.push({
                    filePath: file.getFilePath(),
                    line: call.getStartLineNumber(),
                    reason: result,
                });
                continue;
            }

            taken.add(result.hookPath);
            extractions.push(result);
        }
    }

    return { extractions, skips };
};
