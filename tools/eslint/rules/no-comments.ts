import {
    AST_NODE_TYPES,
    ESLintUtils,
    TSESTree,
} from "@typescript-eslint/utils";

type Options = [{ allow: string[] }];
type MessageIds = "comment";

const SHEBANG = "#!";

export const noComments = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        fixable: "code",
        docs: {
            description:
                "Forbid comments so intent lives in names and abstractions.",
        },
        messages: {
            comment:
                "Remove this comment. Rename the symbol or extract the abstraction it explains.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    allow: { type: "array", items: { type: "string" } },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{ allow: [] }],
    create(context, [{ allow }]) {
        const { sourceCode } = context;
        const text = sourceCode.getText();
        const allowed = allow.map((pattern) => new RegExp(pattern));

        const emptyContainerRange = (
            comment: TSESTree.Comment,
        ): TSESTree.Range => {
            const node = sourceCode.getNodeByRangeIndex(comment.range[0]);
            const container =
                node?.type === AST_NODE_TYPES.JSXExpressionContainer
                    ? node
                    : node?.parent?.type ===
                        AST_NODE_TYPES.JSXExpressionContainer
                      ? node.parent
                      : undefined;

            return container?.expression.type ===
                AST_NODE_TYPES.JSXEmptyExpression
                ? container.range
                : comment.range;
        };

        const withSurroundingLine = ([
            start,
            end,
        ]: TSESTree.Range): TSESTree.Range => {
            let from = start;

            while (
                from > 0 &&
                (text[from - 1] === " " || text[from - 1] === "\t")
            ) {
                from--;
            }

            if (from > 0 && text[from - 1] !== "\n") return [start, end];

            let to = end;

            while (text[to] === " " || text[to] === "\t") to++;
            if (text[to] === "\r") to++;
            if (text[to] !== "\n") return [start, end];

            return [from, to + 1];
        };

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    if (comment.range[0] === 0 && text.startsWith(SHEBANG)) {
                        continue;
                    }

                    if (
                        allowed.some((pattern) => pattern.test(comment.value))
                    ) {
                        continue;
                    }

                    context.report({
                        loc: comment.loc,
                        messageId: "comment",
                        fix: (fixer) =>
                            fixer.removeRange(
                                withSurroundingLine(
                                    emptyContainerRange(comment),
                                ),
                            ),
                    });
                }
            },
        };
    },
});
