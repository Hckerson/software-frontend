import {
    AST_NODE_TYPES,
    ESLintUtils,
    TSESTree,
} from "@typescript-eslint/utils";

type Options = [];
type MessageIds = "responsiveChain" | "arbitraryValue";

const RESPONSIVE_TOKEN = /^(?:max-)?(?:sm|md|lg|xl|2xl):\S+$/;
const ARBITRARY_TOKEN = /\[[^\]]+\]/;

const classTokens = (value: string): string[] =>
    value.split(/\s+/).filter(Boolean);

const withinClassName = (node: TSESTree.Node): boolean => {
    for (
        let current: TSESTree.Node | undefined = node;
        current;
        current = current.parent
    ) {
        if (
            current.type === AST_NODE_TYPES.JSXAttribute &&
            current.name.type === AST_NODE_TYPES.JSXIdentifier &&
            current.name.name === "className"
        ) {
            return true;
        }
    }

    return false;
};

export const tokenFirstClassnames = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        docs: {
            description:
                "Forbid inline responsive utility chains and arbitrary values in class names.",
        },
        messages: {
            responsiveChain:
                "'{{token}}' is an inline responsive chain. Name the scale once in styles/globals.css or reach for clamp(), then reference that class.",
            arbitraryValue:
                "'{{token}}' hardcodes a value. Declare it in styles/tokens.css and reference the token.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const inspect = (node: TSESTree.Node, value: string): void => {
            const isClassName = withinClassName(node);

            for (const token of classTokens(value)) {
                if (RESPONSIVE_TOKEN.test(token)) {
                    context.report({
                        node,
                        messageId: "responsiveChain",
                        data: { token },
                    });
                    continue;
                }

                if (isClassName && ARBITRARY_TOKEN.test(token)) {
                    context.report({
                        node,
                        messageId: "arbitraryValue",
                        data: { token },
                    });
                }
            }
        };

        return {
            Literal(node) {
                if (typeof node.value === "string") inspect(node, node.value);
            },
            TemplateElement(node) {
                if (node.value.cooked) inspect(node, node.value.cooked);
            },
        };
    },
});
