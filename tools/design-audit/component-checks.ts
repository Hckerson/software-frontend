import { COMPONENT_NAME, folderBlocks } from "./docs";
import { countCheck, missing } from "./shared";
import type { Documents, Finding, Inventory } from "./types";

export const fileName = (component: string): string =>
    component
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();

export const checkComponents = (
    docs: Documents,
    code: Inventory,
): Finding[] => {
    const blocks = folderBlocks(docs.components, COMPONENT_NAME);
    const total = blocks
        .flatMap((block) => block.folders)
        .reduce(
            (sum, folder) => sum + (code.componentFiles[folder]?.length ?? 0),
            0,
        );

    return [
        ...blocks.flatMap((block) => {
            const built = block.folders.flatMap(
                (folder) => code.componentFiles[folder] ?? [],
            );
            const named = block.names.map(fileName);
            const where = block.folders.join(" + ");

            return [
                ...(block.claimed === built.length
                    ? []
                    : [
                          {
                              check: "components",
                              message: `07 says ${where} has ${block.claimed}; it holds ${built.length}`,
                          },
                      ]),
                ...missing(named, built).map((file) => ({
                    check: "components",
                    message: `${file} is documented in 07 (${where}) but has no file`,
                })),
                ...missing(built, named).map((file) => ({
                    check: "components",
                    message: `${where}/${file}.tsx is built but undocumented in 07`,
                })),
            ];
        }),
        ...countCheck("components", docs.readme, "components", total),
    ];
};
