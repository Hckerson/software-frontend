import { SECTION_NAME, folderBlocks, sitemapRoutes } from "./docs";
import { countCheck, missing } from "./shared";
import type { Documents, Finding, Inventory } from "./types";

const FALLBACKS = ["/not-found", "/error"];

export const checkRoutes = (docs: Documents, code: Inventory): Finding[] => {
    const mapped = sitemapRoutes(docs.architecture).filter(
        (route) => !FALLBACKS.includes(route),
    );

    return [
        ...missing(mapped, code.routes).map((route) => ({
            check: "routes",
            message: `${route} is in the sitemap but has no page.tsx`,
        })),
        ...missing(code.routes, mapped).map((route) => ({
            check: "routes",
            message: `${route} has a page.tsx but is not in the sitemap`,
        })),
        ...FALLBACKS.filter((route) => !code.fallbacks[route]).map((route) => ({
            check: "routes",
            message: `fallback ${route} is documented but app${route}.tsx is missing`,
        })),
        ...countCheck("routes", docs.readme, "routes", code.routes.length),
    ];
};

export const checkSections = (docs: Documents, code: Inventory): Finding[] => {
    const blocks = folderBlocks(docs.sections, SECTION_NAME);
    const blueprinted = blocks.flatMap((block) => block.names);
    const built = Object.values(code.sectionFiles).flat();
    const headed = blocks.flatMap((block) => block.folders);

    return [
        ...blocks.flatMap((block) => {
            const folder = block.folders[0] ?? "";
            const held = code.sectionFiles[folder]?.length ?? 0;

            return block.claimed === held
                ? []
                : [
                      {
                          check: "sections",
                          message: `06 says ${folder}/ has ${block.claimed} sections; it holds ${held}`,
                      },
                  ];
        }),
        ...missing(blueprinted, built).map((name) => ({
            check: "sections",
            message: `${name} is blueprinted in 06 but has no file`,
        })),
        ...missing(built, blueprinted).map((name) => ({
            check: "sections",
            message: `${name} is built but has no blueprint in 06`,
        })),
        ...missing(Object.keys(code.sectionFiles), headed).map((folder) => ({
            check: "sections",
            message: `components/sections/${folder}/ has no heading in 06`,
        })),
        ...countCheck("sections", docs.readme, "sections", built.length),
    ];
};

export const checkErrorRung = (code: Inventory): Finding[] =>
    missing(code.queryReaders, code.errorRenderers).map((name) => ({
        check: "states",
        message: `${name} reads a query hook but never renders ErrorState`,
    }));
