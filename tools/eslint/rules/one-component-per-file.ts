import { ESLintUtils } from "@typescript-eslint/utils";
import { baseName, componentTracker, kebabCase } from "../ast";

type Options = [];
type MessageIds = "multipleComponents" | "filenameMismatch";

export const oneComponentPerFile = ESLintUtils.RuleCreator.withoutDocs<
    Options,
    MessageIds
>({
    meta: {
        type: "problem",
        docs: {
            description:
                "One component per file, in a kebab-case file named after the component.",
        },
        messages: {
            multipleComponents:
                "'{{name}}' is a second component in this file. Move it to '{{expected}}' and import it.",
            filenameMismatch:
                "Component '{{name}}' belongs in '{{expected}}', not '{{actual}}'.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const { primary, secondary, listeners } = componentTracker();

        return {
            ...listeners,
            "Program:exit"() {
                const component = primary();

                if (!component) return;

                for (const [name, node] of secondary()) {
                    context.report({
                        node,
                        messageId: "multipleComponents",
                        data: { name, expected: `${kebabCase(name)}.tsx` },
                    });
                }

                const [name, node] = component;
                const actual = baseName(context.filename);
                const expected = kebabCase(name);

                if (actual === expected) return;

                context.report({
                    node,
                    messageId: "filenameMismatch",
                    data: {
                        name,
                        expected: `${expected}.tsx`,
                        actual: `${actual}.tsx`,
                    },
                });
            },
        };
    },
});
