import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { format, resolveConfig } from "prettier";
import { openApiDocument } from "./openapi-document";
import { routesFile, schemasFile } from "./generate-contract";

const SOURCE = process.env.CONTRACT_SOURCE ?? "../backend/openapi.json";
const OUTPUT_DIR = "lib/contract";
const CHECK = process.argv.includes("--check");

const formatted = async (path: string, source: string): Promise<string> => {
    const options = await resolveConfig(path);

    return format(source, { ...options, filepath: path });
};

const main = async (): Promise<void> => {
    if (!existsSync(SOURCE)) {
        process.stdout.write(
            CHECK
                ? `${SOURCE} not found - contract check skipped\n`
                : `${SOURCE} not found - run pnpm openapi in backend first\n`,
        );
        process.exit(CHECK ? 0 : 1);
    }

    const document = openApiDocument.parse(
        JSON.parse(readFileSync(SOURCE, "utf8")),
    );
    const schemas = document.components?.schemas ?? {};

    const files: Record<string, string> = {
        [`${OUTPUT_DIR}/schemas.ts`]: schemasFile(schemas),
        [`${OUTPUT_DIR}/routes.ts`]: routesFile(document.paths),
    };

    if (!CHECK) mkdirSync(OUTPUT_DIR, { recursive: true });

    const stale: string[] = [];

    for (const [path, source] of Object.entries(files)) {
        const output = await formatted(path, source);

        if (!CHECK) {
            writeFileSync(path, output);
            continue;
        }

        const current = existsSync(path) ? readFileSync(path, "utf8") : "";

        if (current !== output) stale.push(path);
    }

    if (CHECK) {
        if (stale.length === 0) {
            process.stdout.write("contract is up to date\n");
            return;
        }

        process.stderr.write(
            `contract is stale: ${stale.join(", ")}\nrun pnpm contract after changing a Nest DTO\n`,
        );
        process.exit(1);
    }

    process.stdout.write(
        `${OUTPUT_DIR}: ${Object.keys(schemas).length} schemas, ${Object.keys(document.paths).length} routes from ${SOURCE}\n`,
    );
};

void main();
