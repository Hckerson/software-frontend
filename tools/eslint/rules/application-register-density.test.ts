import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import {
    applicationRegisterDensity,
    DENSITY_STEPS,
} from "./application-register-density";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("application-register-density", applicationRegisterDensity, {
    valid: [
        {
            name: "the application register's own spacing ladder",
            filename: "components/common/stat-band.tsx",
            code: `export const StatBand = () => <div className="flex h-14 items-center gap-2 p-3" />;`,
        },
        {
            name: "the first section's padding and the section gap",
            filename: "components/common/overview.tsx",
            code: `export const Overview = () => <section className="flex flex-col gap-4 py-6" />;`,
        },
        {
            name: "horizontal gutters, which carry no vertical cost",
            filename: "components/common/shell.tsx",
            code: `export const Shell = () => <div className="px-6 pt-16 pb-10" />;`,
        },
        {
            name: "application titles and the compact field",
            filename: "components/common/heading.tsx",
            code: `export const Heading = () => <h1 className="text-h4 font-display font-light" />;`,
        },
        {
            name: "fractional steps below the ceiling",
            filename: "components/common/chip.tsx",
            code: `export const Chip = () => <span className="gap-1.5 px-1.5 py-0.5" />;`,
        },
    ],
    invalid: [
        {
            name: "an editorial card body",
            filename: "components/common/card.tsx",
            code: `export const Card = () => <article className="rounded-lg border p-6" />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "p-6", step: DENSITY_STEPS.pad },
                },
            ],
        },
        {
            name: "editorial section padding and stacking",
            filename: "components/common/panel.tsx",
            code: `export const Panel = () => <section className="flex flex-col gap-8 py-10" />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "gap-8", step: DENSITY_STEPS.gap },
                },
                {
                    messageId: "spacingCeiling",
                    data: { token: "py-10", step: DENSITY_STEPS.section },
                },
            ],
        },
        {
            name: "axis gaps and space utilities",
            filename: "components/common/grid.tsx",
            code: `export const Grid = () => <div className="gap-x-6 gap-y-5 space-y-12" />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "gap-x-6", step: DENSITY_STEPS.gap },
                },
                {
                    messageId: "spacingCeiling",
                    data: { token: "gap-y-5", step: DENSITY_STEPS.gap },
                },
                {
                    messageId: "spacingCeiling",
                    data: { token: "space-y-12", step: DENSITY_STEPS.gap },
                },
            ],
        },
        {
            name: "an editorial heading in a view",
            filename: "components/common/hero.tsx",
            code: `export const Hero = () => <h2 className="text-h2 font-display" />;`,
            errors: [
                { messageId: "editorialType", data: { token: "text-h2" } },
            ],
        },
        {
            name: "a ceiling breach behind a state variant",
            filename: "components/common/row.tsx",
            code: `export const Row = () => <div className="p-3 hover:p-6" />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "hover:p-6", step: DENSITY_STEPS.pad },
                },
            ],
        },
        {
            name: "class strings nested in a clsx call",
            filename: "components/common/tile.tsx",
            code: `import clsx from "clsx";\nexport const Tile = () => <div className={clsx("flex", "p-8")} />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "p-8", step: DENSITY_STEPS.pad },
                },
            ],
        },
        {
            name: "a variant map hoisted out of the className attribute",
            filename: "components/common/section.tsx",
            code: `const paddings = { roomy: "py-16" };\nexport const Section = () => <section className={paddings.roomy} />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "py-16", step: DENSITY_STEPS.section },
                },
            ],
        },
        {
            name: "a breach inside a template literal className",
            filename: "components/common/stack.tsx",
            code: `export const Stack = ({ extra }: { extra: string }) => <div className={\`flex gap-10 \${extra}\`} />;`,
            errors: [
                {
                    messageId: "spacingCeiling",
                    data: { token: "gap-10", step: DENSITY_STEPS.gap },
                },
            ],
        },
    ],
});
