import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { COMPONENT_NAME, folderBlocks } from "./docs";
import {
    hookSources,
    importedHooks,
    queryHooks,
    routes,
    stem,
    views,
} from "./code";
import type { Inventory } from "./types";

export const inventory = (root: string, componentDoc: string): Inventory => {
    const sectionsDir = join(root, "components/sections");
    const folders = existsSync(sectionsDir) ? readdirSync(sectionsDir) : [];
    const sections = folders.flatMap((folder) =>
        views(join(sectionsDir, folder)),
    );
    const queries = queryHooks(hookSources(join(root, "lib/hooks")));
    const source = (path: string) => readFileSync(path, "utf8");

    return {
        routes: routes(join(root, "app")),
        fallbacks: {
            "/not-found": existsSync(join(root, "app/not-found.tsx")),
            "/error": existsSync(join(root, "app/error.tsx")),
        },
        sectionFiles: Object.fromEntries(
            folders.map((folder) => [
                folder,
                views(join(sectionsDir, folder)).map(stem),
            ]),
        ),
        componentFiles: Object.fromEntries(
            folderBlocks(componentDoc, COMPONENT_NAME)
                .flatMap((block) => block.folders)
                .map((folder) => [
                    folder,
                    views(join(root, "components", folder)).map(stem),
                ]),
        ),
        queryReaders: sections
            .filter((path) =>
                importedHooks(source(path)).some((hook) => queries.has(hook)),
            )
            .map(stem),
        errorRenderers: sections
            .filter((path) => source(path).includes("ErrorState"))
            .map(stem),
    };
};
