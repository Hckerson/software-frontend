import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { pageComposesOnly } from "./page-composes-only";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("page-composes-only", pageComposesOnly, {
    valid: [
        {
            name: "a page composing imported sections",
            filename: "app/page.tsx",
            code: `import { Hero } from "@/components/common/hero";\nexport default function Home() {\n    return <Hero />;\n}`,
        },
        {
            name: "a page holding page-level state",
            filename: "app/page.tsx",
            code: `import { useState } from "react";\nimport { Panel } from "@/components/common/panel";\nexport default function Home() {\n    const [open, setOpen] = useState(false);\n    return <Panel open={open} onToggle={() => setOpen(!open)} />;\n}`,
        },
        {
            name: "a page consuming seed data from lib/data",
            filename: "app/page.tsx",
            code: `import { metrics } from "@/lib/data/metrics";\nimport { Grid } from "@/components/common/grid";\nexport default function Home() {\n    return <Grid items={metrics} />;\n}`,
        },
        {
            name: "a hook dependency array is not seed data",
            filename: "app/page.tsx",
            code: `import { useEffect, useState } from "react";\nexport default function Home() {\n    const [term, setTerm] = useState("");\n    const [delay, setDelay] = useState(0);\n    useEffect(() => setTerm(""), [term, delay]);\n    return <div>{term}</div>;\n}`,
        },
    ],
    invalid: [
        {
            name: "a module-scope seed array",
            filename: "app/page.tsx",
            code: `const navigation = ["home", "settings"];\nexport default function Home() {\n    return <nav>{navigation.length}</nav>;\n}`,
            errors: [{ messageId: "inlineData", data: { name: "navigation" } }],
        },
        {
            name: "a record array declared inside the page",
            filename: "app/page.tsx",
            code: `export default function Home() {\n    const rows = [{ id: "a" }, { id: "b" }];\n    return <ul>{rows.length}</ul>;\n}`,
            errors: [{ messageId: "inlineData", data: { name: "rows" } }],
        },
        {
            name: "an inline sub-component",
            filename: "app/page.tsx",
            code: `function Row() {\n    return <li />;\n}\nexport default function Home() {\n    return <ul><Row /></ul>;\n}`,
            errors: [
                {
                    messageId: "inlineComponent",
                    data: { name: "Row", expected: "row.tsx" },
                },
            ],
        },
    ],
});
