import {
    AST_NODE_TYPES,
    ESLintUtils,
    TSESTree,
} from "@typescript-eslint/utils";
import { componentTracker, isFunctionNode, kebabCase } from "../ast";

type Options = [{ minimumDataElements: number }];
type MessageIds = "inlineComponent" | "inlineData";

const declaredName = (node: TSESTree.VariableDeclarator): string =>
    node.id.type === AST_NODE_TYPES.Identifier ? node.id.name : "this array";

export const pageComposesOnly = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        docs: {
            description:
                "Keep route files composing sections: no inline seed data, no inline sub-components.",
        },
        messages: {
            inlineComponent:
                "'{{name}}' is defined inside a route file. Move it to 'components/{{expected}}' and compose it here.",
            inlineData:
                "Move '{{name}}' to lib/data/. A route file composes sections; it does not define data.",
        },
        schema: [
            {
                type: "object",
                properties: { minimumDataElements: { type: "number" } },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{ minimumDataElements: 2 }],
    create(context, [{ minimumDataElements }]) {
        const { secondary, listeners } = componentTracker();

        return {
            ...listeners,
            VariableDeclarator(node) {
                if (node.init?.type !== AST_NODE_TYPES.ArrayExpression) return;

                const { elements } = node.init;

                if (elements.length < minimumDataElements) return;

                const records = elements.every(
                    (element) =>
                        element?.type === AST_NODE_TYPES.ObjectExpression,
                );
                const atModuleScope = context.sourceCode
                    .getAncestors(node)
                    .every((ancestor) => !isFunctionNode(ancestor));

                if (!records && !atModuleScope) return;

                context.report({
                    node,
                    messageId: "inlineData",
                    data: { name: declaredName(node) },
                });
            },
            "Program:exit"() {
                for (const [name, node] of secondary()) {
                    context.report({
                        node,
                        messageId: "inlineComponent",
                        data: { name, expected: `${kebabCase(name)}.tsx` },
                    });
                }
            },
        };
    },
});
