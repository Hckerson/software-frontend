import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { tokenFirstClassnames } from "./token-first-classnames";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("token-first-classnames", tokenFirstClassnames, {
    valid: [
        {
            name: "named scale classes and plain utilities",
            filename: "components/common/button.tsx",
            code: `export const Button = () => <button className="pad gap smooth flex items-center rounded-lg" />;`,
        },
        {
            name: "state variants, which are not responsive",
            filename: "components/common/button.tsx",
            code: `export const Button = () => <button className="hover:bg-accent focus:outline-none disabled:opacity-50 group-hover:text-text dark:bg-sidebar" />;`,
        },
        {
            name: "theme colour utilities",
            filename: "components/common/button.tsx",
            code: `export const Button = () => <button className="bg-accent text-text-inverse border-border" />;`,
        },
        {
            name: "a bracketed expression outside a className",
            filename: "lib/utils/pick.ts",
            code: `export const first = (values: string[]) => "values[0]";`,
        },
        {
            name: "a time format string outside a className",
            filename: "lib/constants.ts",
            code: `export const TIME_FORMAT = "HH:mm";`,
        },
    ],
    invalid: [
        {
            name: "a responsive chain in a className",
            filename: "components/common/button.tsx",
            code: `export const Button = () => <button className="h-9 lg:h-11 xl:h-12" />;`,
            errors: [
                { messageId: "responsiveChain", data: { token: "lg:h-11" } },
                { messageId: "responsiveChain", data: { token: "xl:h-12" } },
            ],
        },
        {
            name: "an arbitrary value in a className",
            filename: "components/common/button.tsx",
            code: `export const Button = () => <button className="h-[36px] bg-[#051726]" />;`,
            errors: [
                { messageId: "arbitraryValue", data: { token: "h-[36px]" } },
                {
                    messageId: "arbitraryValue",
                    data: { token: "bg-[#051726]" },
                },
            ],
        },
        {
            name: "class strings nested in a clsx call",
            filename: "components/common/button.tsx",
            code: `import clsx from "clsx";\nexport const Button = () => <button className={clsx("flex", "md:rounded-2xl")} />;`,
            errors: [
                {
                    messageId: "responsiveChain",
                    data: { token: "md:rounded-2xl" },
                },
            ],
        },
        {
            name: "class strings used as clsx object keys",
            filename: "components/common/button.tsx",
            code: `import clsx from "clsx";\nexport const Button = ({ big }: { big: boolean }) => <button className={clsx({ "w-25 lg:w-30": big })} />;`,
            errors: [
                { messageId: "responsiveChain", data: { token: "lg:w-30" } },
            ],
        },
        {
            name: "a class map hoisted out of the className attribute",
            filename: "components/common/button.tsx",
            code: `const sizes = { small: "h-9 lg:h-11" };\nexport const Button = () => <button className={sizes.small} />;`,
            errors: [
                { messageId: "responsiveChain", data: { token: "lg:h-11" } },
            ],
        },
        {
            name: "a responsive chain inside a template literal className",
            filename: "components/common/button.tsx",
            code: `export const Button = ({ extra }: { extra: string }) => <button className={\`flex md:gap-x-2 \${extra}\`} />;`,
            errors: [
                { messageId: "responsiveChain", data: { token: "md:gap-x-2" } },
            ],
        },
    ],
});
