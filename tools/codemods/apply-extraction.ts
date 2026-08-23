import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { CopiedImport, Extraction, Plan } from "./plan-extraction";
import { HOOKS_DIR, rootIdentifier } from "./transport-calls";

const importStatement = (copied: CopiedImport): string => {
    if (copied.namespace) {
        return `import * as ${copied.local} from "${copied.moduleSpecifier}";`;
    }

    if (!copied.imported) {
        return `import ${copied.local} from "${copied.moduleSpecifier}";`;
    }

    return copied.imported === copied.local
        ? `import { ${copied.local} } from "${copied.moduleSpecifier}";`
        : `import { ${copied.imported} as ${copied.local} } from "${copied.moduleSpecifier}";`;
};

const uniqueImports = (imports: CopiedImport[]): CopiedImport[] => {
    const seen = new Set<string>();

    return imports.filter((copied) => {
        const key = `${copied.moduleSpecifier}:${copied.local}`;
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

export const hookModuleSpecifier = (extraction: Extraction): string =>
    `@/${HOOKS_DIR}/${extraction.hookPath.split("/").at(-1)?.replace(/\.ts$/, "")}`;

export const hookSource = (
    extraction: Extraction,
    callText: string,
): string => {
    const imports = uniqueImports(extraction.imports)
        .map(importStatement)
        .join("\n");
    const parameters = extraction.parameters
        .map((parameter) => `${parameter.name}: ${parameter.type}`)
        .join(", ");
    const queryKey = [
        JSON.stringify(extraction.resource),
        ...extraction.parameters.map((parameter) => parameter.name),
    ].join(", ");

    return [
        `import { useQuery } from "@tanstack/react-query";`,
        imports,
        ``,
        `export const ${extraction.name} = (${parameters}) =>`,
        `    useQuery({`,
        `        queryKey: [${queryKey}],`,
        `        queryFn: () => ${callText},`,
        `    });`,
        ``,
    ].join("\n");
};

const isReferenced = (file: SourceFile, name: string): boolean =>
    file
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .some(
            (identifier) =>
                identifier.getText() === name &&
                !identifier.getFirstAncestorByKind(
                    SyntaxKind.ImportDeclaration,
                ),
        );

const pruneImports = (file: SourceFile, names: string[]): void => {
    for (const declaration of [...file.getImportDeclarations()]) {
        if (!declaration.getImportClause()) continue;

        const single =
            declaration.getNamespaceImport()?.getText() ??
            declaration.getDefaultImport()?.getText();

        if (single && names.includes(single) && !isReferenced(file, single)) {
            declaration.remove();
            continue;
        }

        let emptied = false;

        for (const specifier of [...declaration.getNamedImports()]) {
            const local =
                specifier.getAliasNode()?.getText() ?? specifier.getName();

            if (names.includes(local) && !isReferenced(file, local)) {
                specifier.remove();
                emptied = true;
            }
        }

        if (
            emptied &&
            declaration.getNamedImports().length === 0 &&
            !declaration.getDefaultImport() &&
            !declaration.getNamespaceImport()
        ) {
            declaration.remove();
        }
    }
};

export const applyExtraction = (project: Project, plan: Plan): void => {
    const prepared = plan.extractions.map((extraction) => ({
        extraction,
        callText: extraction.call.getText(),
        position: extraction.call.getStart(),
        prunable: [
            rootIdentifier(extraction.call.getExpression())?.getText(),
            ...extraction.imports.map((copied) => copied.local),
        ].filter((name): name is string => name !== undefined),
    }));

    for (const { extraction, callText } of prepared) {
        project.createSourceFile(
            extraction.hookPath,
            hookSource(extraction, callText),
        );
    }

    for (const entry of [...prepared].sort(
        (left, right) => right.position - left.position,
    )) {
        const argumentList = entry.extraction.parameters
            .map((parameter) => parameter.name)
            .join(", ");

        entry.extraction.call.replaceWithText(
            `${entry.extraction.name}(${argumentList})`,
        );
    }

    for (const { extraction, prunable } of prepared) {
        extraction.file.addImportDeclaration({
            moduleSpecifier: hookModuleSpecifier(extraction),
            namedImports: [extraction.name],
        });

        pruneImports(extraction.file, prunable);
    }
};
