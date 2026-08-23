import { starter } from "./tools/eslint";
import type { ConfigArray } from "typescript-eslint";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

const TRANSPORT_MODULE = "@/lib/api-client";
const MAX_FILE_LINES = 150;

const GENERATED = "lib/contract/**";
const VIEWS = ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"];
const SOURCE = [...VIEWS, "lib/**/*.{ts,tsx}"];
const ROUTES = ["app/**/page.tsx"];
const COMPONENTS = ["components/**/*.tsx"];
const TESTS = ["**/*.test.ts"];

type RestrictedPath = { name: string; message: string };

type RestrictedImports = [
    "error",
    {
        paths: RestrictedPath[];
        patterns: { group: string[]; message: string }[];
    },
];

const ID_SOURCE = "IDs come from nanoid — never uuid or Date.now().";

const restrictedImports = (...paths: RestrictedPath[]): RestrictedImports => [
    "error",
    {
        paths: [{ name: "uuid", message: ID_SOURCE }, ...paths],
        patterns: [
            {
                group: ["../*", "../**"],
                message:
                    "Import through the '@/' alias. Deep-relative paths break when a file moves.",
            },
        ],
    },
];

const starterConfig: ConfigArray = [
    {
        plugins: { starter },
    },
    {
        rules: { "starter/no-comments": "error" },
    },
    {
        files: SOURCE,
        rules: {
            "starter/api-access-boundary": "error",
            "no-restricted-imports": restrictedImports(),
            "max-lines": [
                "error",
                {
                    max: MAX_FILE_LINES,
                    skipBlankLines: false,
                    skipComments: false,
                },
            ],
            "no-console": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "no-restricted-properties": [
                "error",
                { object: "Date", property: "now", message: ID_SOURCE },
            ],
        },
    },
    {
        files: VIEWS,
        rules: {
            "starter/application-register-density": "error",
            "starter/domain-types-in-lib": "error",
            "starter/token-first-classnames": "error",
            "no-restricted-imports": restrictedImports({
                name: TRANSPORT_MODULE,
                message:
                    "Components consume hooks. Import a use-<resource> hook from @/lib/hooks instead.",
            }),
        },
    },
    {
        files: COMPONENTS,
        rules: { "starter/one-component-per-file": "error" },
    },
    {
        files: ROUTES,
        rules: { "starter/page-composes-only": "error" },
    },
    {
        files: TESTS,
        rules: { "max-lines": "off" },
    },
];

const eslintConfig = [
    ...defineConfig([
        ...nextVitals,
        ...nextTs,
        globalIgnores([
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
            GENERATED,
        ]),
    ]),
    ...starterConfig,
];

export default eslintConfig;
