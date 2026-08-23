import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { openApiDocument } from "./openapi-document";
import { routesFile, schemasFile } from "./generate-contract";

const SOURCE = process.env.CONTRACT_SOURCE ?? "../nest-setup/openapi.json";
const OUTPUT_DIR = "lib/contract";

const document = openApiDocument.parse(
    JSON.parse(readFileSync(SOURCE, "utf8")),
);

const schemas = document.components?.schemas ?? {};

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(`${OUTPUT_DIR}/schemas.ts`, schemasFile(schemas));
writeFileSync(`${OUTPUT_DIR}/routes.ts`, routesFile(document.paths));

process.stdout.write(
    `${OUTPUT_DIR}: ${Object.keys(schemas).length} schemas, ${Object.keys(document.paths).length} routes from ${SOURCE}\n`,
);
