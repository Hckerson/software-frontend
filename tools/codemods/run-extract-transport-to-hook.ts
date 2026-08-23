import { Project } from "ts-morph";
import { planExtraction } from "./plan-extraction";
import { applyExtraction } from "./apply-extraction";

const rootPath = process.cwd().replace(/\\/g, "/");
const shouldWrite = process.argv.includes("--write");

const relative = (filePath: string): string =>
    filePath.replace(/\\/g, "/").replace(`${rootPath}/`, "");

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const plan = planExtraction(project, rootPath);

const lines = [
    ...plan.extractions.map(
        (extraction) =>
            `extract  ${relative(extraction.file.getFilePath())} -> ${relative(extraction.hookPath)} (${extraction.name})`,
    ),
    ...plan.skips.map(
        (skip) =>
            `skip     ${relative(skip.filePath)}:${skip.line} - ${skip.reason}`,
    ),
];

const summary = `${plan.extractions.length} extractable, ${plan.skips.length} needing a decision`;

if (shouldWrite && plan.extractions.length > 0) {
    applyExtraction(project, plan);
    project.saveSync();
}

process.stdout.write(
    [
        ...lines,
        summary,
        shouldWrite
            ? "written - run pnpm format && pnpm lint"
            : "dry run - pass --write to apply",
        "",
    ].join("\n"),
);
