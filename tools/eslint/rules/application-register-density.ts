import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

type Options = [];
type MessageIds = "spacingCeiling" | "editorialType";

type Ceiling = { pattern: RegExp; max: number; step: string };

export const DENSITY_STEPS = {
    pad: "p-3 on a dense body, p-4 on the one hero tile",
    section: "py-4 per section, py-6 on the route's first section",
    gap: "gap-2 inside a row, gap-3 card to card, gap-4 section to section",
} as const;

const CEILINGS: Ceiling[] = [
    { pattern: /^p-(\d+(?:\.\d+)?)$/, max: 4, step: DENSITY_STEPS.pad },
    { pattern: /^py-(\d+(?:\.\d+)?)$/, max: 6, step: DENSITY_STEPS.section },
    {
        pattern: /^(?:gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.\d+)?)$/,
        max: 4,
        step: DENSITY_STEPS.gap,
    },
];

const EDITORIAL_TYPE = /^text-h[123]$/;

const OPT_OUT =
    "Editorial routes opt out with a files block in eslint.config.ts.";

const classTokens = (value: string): string[] =>
    value.split(/\s+/).filter(Boolean);

const utility = (token: string): string =>
    token.slice(token.lastIndexOf(":") + 1);

export const applicationRegisterDensity = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        docs: {
            description:
                "Hold view code to the application register's spacing ceiling and title scale.",
        },
        messages: {
            spacingCeiling: `'{{token}}' is an editorial spacing step. The application register stops at {{step}} — editorial spacing is how a dashboard becomes a scroll. ${OPT_OUT}`,
            editorialType: `'{{token}}' is an editorial heading. A page title is text-h4 and a section title is text-h5; the field sits at text-xs. ${OPT_OUT}`,
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const inspect = (node: TSESTree.Node, value: string): void => {
            for (const token of classTokens(value)) {
                const name = utility(token);

                if (EDITORIAL_TYPE.test(name)) {
                    context.report({
                        node,
                        messageId: "editorialType",
                        data: { token },
                    });
                    continue;
                }

                for (const { pattern, max, step } of CEILINGS) {
                    const amount = pattern.exec(name)?.at(1);

                    if (!amount || Number(amount) <= max) continue;

                    context.report({
                        node,
                        messageId: "spacingCeiling",
                        data: { token, step },
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
