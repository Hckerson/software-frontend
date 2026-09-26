import {
    ASTUtils,
    AST_NODE_TYPES,
    ESLintUtils,
    TSESTree,
} from "@typescript-eslint/utils";
import { functionName, isFunctionNode } from "../ast";

type Options = [{ clientModules: string[]; hooksDir: string }];
type MessageIds = "outsideHooksDir" | "outsideHookFunction";

const HOOK_NAME = /^use[A-Z0-9]/;

const rootIdentifier = (node: TSESTree.Node): TSESTree.Identifier | null => {
    let current = node;

    while (current.type === AST_NODE_TYPES.MemberExpression) {
        current = current.object;
    }

    return current.type === AST_NODE_TYPES.Identifier ? current : null;
};

const isWithinHooksDir = (filename: string, hooksDir: string): boolean => {
    const path = `/${filename.replace(/\\/g, "/").replace(/^\/+/, "")}`;
    const segment = `/${hooksDir.replace(/^\/+|\/+$/g, "")}/`;

    return path.includes(segment);
};

export const apiAccessBoundary = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        docs: {
            description:
                "Restrict transport-layer calls to use-* hooks inside the hooks directory.",
        },
        messages: {
            outsideHooksDir:
                "'{{name}}' may only be called from a hook in '{{hooksDir}}'. Wrap the request in a use-<resource> hook and consume that hook here.",
            outsideHookFunction:
                "'{{name}}' must be called inside a use* hook function. Move the call into the hook body.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    clientModules: { type: "array", items: { type: "string" } },
                    hooksDir: { type: "string" },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        { clientModules: ["@/lib/api-client"], hooksDir: "lib/hooks" },
    ],
    create(context, [{ clientModules, hooksDir }]) {
        const importsTransport = (identifier: TSESTree.Identifier): boolean => {
            const scope = context.sourceCode.getScope(identifier);
            const declaration = ASTUtils.findVariable(
                scope,
                identifier,
            )?.defs.at(0)?.node.parent;

            return (
                declaration?.type === AST_NODE_TYPES.ImportDeclaration &&
                clientModules.includes(declaration.source.value)
            );
        };

        return {
            CallExpression(node) {
                const root = rootIdentifier(node.callee);
                if (!root || !importsTransport(root)) return;

                if (!isWithinHooksDir(context.filename, hooksDir)) {
                    context.report({
                        node,
                        messageId: "outsideHooksDir",
                        data: { name: root.name, hooksDir },
                    });
                    return;
                }

                const enclosingHook = context.sourceCode
                    .getAncestors(node)
                    .some(
                        (ancestor) =>
                            isFunctionNode(ancestor) &&
                            HOOK_NAME.test(functionName(ancestor) ?? ""),
                    );

                if (!enclosingHook) {
                    context.report({
                        node,
                        messageId: "outsideHookFunction",
                        data: { name: root.name, hooksDir },
                    });
                }
            },
        };
    },
});
