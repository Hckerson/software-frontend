import { AST_NODE_TYPES, TSESLint, TSESTree } from "@typescript-eslint/utils";

export type FunctionNode =
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression;

export const isFunctionNode = (node: TSESTree.Node): node is FunctionNode =>
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.FunctionExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const functionName = (node: FunctionNode): string | null => {
    if (node.type !== AST_NODE_TYPES.ArrowFunctionExpression && node.id) {
        return node.id.name;
    }

    const parent = node.parent;

    if (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.id.type === AST_NODE_TYPES.Identifier
    ) {
        return parent.id.name;
    }

    if (
        (parent.type === AST_NODE_TYPES.Property ||
            parent.type === AST_NODE_TYPES.MethodDefinition) &&
        parent.key.type === AST_NODE_TYPES.Identifier
    ) {
        return parent.key.name;
    }

    return null;
};

export const isComponentName = (name: string): boolean => /^[A-Z]/.test(name);

export const kebabCase = (value: string): string =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();

export const baseName = (filename: string): string =>
    filename
        .replace(/\\/g, "/")
        .split("/")
        .at(-1)
        ?.replace(/\.[jt]sx?$/, "") ?? "";

export type Component = [string, FunctionNode];

export type ComponentTracker = {
    primary: () => Component | undefined;
    secondary: () => Component[];
    listeners: TSESLint.RuleListener;
};

export const componentTracker = (): ComponentTracker => {
    const stack: FunctionNode[] = [];
    const components = new Map<string, FunctionNode>();
    let defaultExport: string | null = null;

    const enter = (node: FunctionNode): void => {
        stack.push(node);
    };

    const exit = (): void => {
        stack.pop();
    };

    const markEnclosing = (): void => {
        for (let index = stack.length - 1; index >= 0; index--) {
            const name = functionName(stack[index]);

            if (!name || !isComponentName(name)) continue;
            if (!components.has(name)) components.set(name, stack[index]);

            return;
        }
    };

    const declared = (): Component[] =>
        [...components.entries()].sort(
            ([, left], [, right]) => left.range[0] - right.range[0],
        );

    const primary = (): Component | undefined => {
        const all = declared();

        return all.find(([name]) => name === defaultExport) ?? all.at(0);
    };

    return {
        primary,
        secondary: () => {
            const kept = primary();

            return declared().filter(([name]) => name !== kept?.at(0));
        },
        listeners: {
            FunctionDeclaration: enter,
            "FunctionDeclaration:exit": exit,
            FunctionExpression: enter,
            "FunctionExpression:exit": exit,
            ArrowFunctionExpression: enter,
            "ArrowFunctionExpression:exit": exit,
            JSXElement: markEnclosing,
            JSXFragment: markEnclosing,
            ExportDefaultDeclaration(node) {
                const { declaration } = node;

                if (declaration.type === AST_NODE_TYPES.Identifier) {
                    defaultExport = declaration.name;
                    return;
                }

                if (
                    declaration.type === AST_NODE_TYPES.FunctionDeclaration &&
                    declaration.id
                ) {
                    defaultExport = declaration.id.name;
                }
            },
        },
    };
};
