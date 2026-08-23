import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { oneComponentPerFile } from "./one-component-per-file";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("one-component-per-file", oneComponentPerFile, {
    valid: [
        {
            name: "a single default component matching its filename",
            filename: "components/common/button.tsx",
            code: `export default function Button() {\n    return <button />;\n}`,
        },
        {
            name: "a multi-word component in a kebab-case file",
            filename: "components/wrappers/motion-wrapper.tsx",
            code: `export default function MotionWrapper() {\n    return <div />;\n}`,
        },
        {
            name: "a windows-style absolute path",
            filename: "C:\\project\\components\\common\\button.tsx",
            code: `export const Button = () => <button />;`,
        },
        {
            name: "a helper that returns no jsx alongside the component",
            filename: "components/common/button.tsx",
            code: `const label = (value: string) => value.trim();\nexport const Button = () => <button>{label("go")}</button>;`,
        },
        {
            name: "a file declaring no component at all",
            filename: "components/common/tokens.ts",
            code: `export const sizes = ["sm", "md"];`,
        },
    ],
    invalid: [
        {
            name: "a second component sharing the file",
            filename: "components/ui/forms/input-template.tsx",
            code: `export default function InputTemplate() {\n    return <div />;\n}\nexport const TextInput = () => <input />;`,
            errors: [
                {
                    messageId: "multipleComponents",
                    data: { name: "TextInput", expected: "text-input.tsx" },
                },
            ],
        },
        {
            name: "a component whose name does not match its file",
            filename: "components/common/card.tsx",
            code: `export default function StatCard() {\n    return <div />;\n}`,
            errors: [
                {
                    messageId: "filenameMismatch",
                    data: {
                        name: "StatCard",
                        expected: "stat-card.tsx",
                        actual: "card.tsx",
                    },
                },
            ],
        },
        {
            name: "a helper component declared above the default export",
            filename: "components/common/button.tsx",
            code: `const Spinner = () => <svg />;\nexport default function Button() {\n    return <button><Spinner /></button>;\n}`,
            errors: [
                {
                    messageId: "multipleComponents",
                    data: { name: "Spinner", expected: "spinner.tsx" },
                },
            ],
        },
        {
            name: "three components in one file",
            filename: "components/ui/forms/input-template.tsx",
            code: `export const InputTemplate = () => <div />;\nexport const TextInput = () => <input />;\nexport const FileInput = () => <input type="file" />;`,
            errors: [
                { messageId: "multipleComponents" },
                { messageId: "multipleComponents" },
            ],
        },
    ],
});
