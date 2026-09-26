import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { domainTypesInLib } from "./domain-types-in-lib";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("domain-types-in-lib", domainTypesInLib, {
    valid: [
        {
            name: "a local props interface that stays unexported",
            filename: "components/common/button.tsx",
            code: `interface Props {\n    label: string;\n}\nexport default function Button(props: Props) {\n    return props.label;\n}`,
        },
        {
            name: "importing a shared type",
            filename: "components/common/button.tsx",
            code: `import type { User } from "@/lib/types";\nexport const name = (user: User) => user.fullName;`,
        },
        {
            name: "exporting a value rather than a type",
            filename: "app/layout.tsx",
            code: `export const metadata = { title: "Starter" };`,
        },
    ],
    invalid: [
        {
            name: "an exported interface",
            filename: "components/common/button.tsx",
            code: `export interface ButtonProps {\n    label: string;\n}`,
            errors: [
                { messageId: "exportedType", data: { name: "ButtonProps" } },
            ],
        },
        {
            name: "an exported type alias",
            filename: "components/common/button.tsx",
            code: `export type Size = "sm" | "lg";`,
            errors: [{ messageId: "exportedType", data: { name: "Size" } }],
        },
        {
            name: "an exported enum",
            filename: "components/common/status.tsx",
            code: `export enum Status {\n    Active = "ACTIVE",\n}`,
            errors: [{ messageId: "exportedType", data: { name: "Status" } }],
        },
        {
            name: "a type-only re-export",
            filename: "components/common/button.tsx",
            code: `type Size = "sm" | "lg";\nexport type { Size };`,
            errors: [{ messageId: "exportedType", data: { name: "Size" } }],
        },
    ],
});
