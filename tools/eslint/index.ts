import type { TSESLint } from "@typescript-eslint/utils";
import { apiAccessBoundary } from "./rules/api-access-boundary";
import { applicationRegisterDensity } from "./rules/application-register-density";
import { domainTypesInLib } from "./rules/domain-types-in-lib";
import { noComments } from "./rules/no-comments";
import { oneComponentPerFile } from "./rules/one-component-per-file";
import { pageComposesOnly } from "./rules/page-composes-only";
import { tokenFirstClassnames } from "./rules/token-first-classnames";

export const starter: TSESLint.FlatConfig.Plugin = {
    meta: { name: "eslint-plugin-starter", version: "0.1.0" },
    rules: {
        "api-access-boundary": apiAccessBoundary,
        "application-register-density": applicationRegisterDensity,
        "domain-types-in-lib": domainTypesInLib,
        "no-comments": noComments,
        "one-component-per-file": oneComponentPerFile,
        "page-composes-only": pageComposesOnly,
        "token-first-classnames": tokenFirstClassnames,
    },
};

export default starter;
