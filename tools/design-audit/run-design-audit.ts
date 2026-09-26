import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkErrorRung, checkRoutes, checkSections } from "./checks";
import { checkComponents } from "./component-checks";
import { inventory } from "./inventory";
import { checkLinks } from "./links";
import type { Documents } from "./types";

const ROOT = process.cwd();
const DOCS = join(ROOT, "docs/design-os");
const doc = (file: string): string => readFileSync(join(DOCS, file), "utf8");

const docs: Documents = {
    readme: doc("README.md"),
    architecture: doc("01-information-architecture.md"),
    sections: doc("06-section-blueprints.md"),
    components: doc("07-component-library.md"),
};

const code = inventory(ROOT, docs.components);

const findings = [
    ...checkRoutes(docs, code),
    ...checkSections(docs, code),
    ...checkComponents(docs, code),
    ...checkErrorRung(code),
    ...checkLinks(DOCS),
];

if (findings.length === 0) {
    process.stdout.write(
        `design-os matches the code: ${code.routes.length} routes, ` +
            `${Object.values(code.sectionFiles).flat().length} sections, ` +
            `${Object.values(code.componentFiles).flat().length} components\n`,
    );
    process.exit(0);
}

for (const finding of findings) {
    process.stdout.write(`[${finding.check}] ${finding.message}\n`);
}

process.stdout.write(`\n${findings.length} design-os finding(s)\n`);
process.exit(1);
