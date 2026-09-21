import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { headingSlugs, relativeLinks } from "./docs";
import type { Finding } from "./types";

export const checkLinks = (docsDir: string): Finding[] => {
    const cache = new Map<string, Set<string>>();
    const anchorsOf = (path: string): Set<string> => {
        const known =
            cache.get(path) ?? headingSlugs(readFileSync(path, "utf8"));

        cache.set(path, known);

        return known;
    };

    return readdirSync(docsDir)
        .filter((file) => file.endsWith(".md"))
        .flatMap((file) => {
            const doc = join(docsDir, file);

            return relativeLinks(readFileSync(doc, "utf8")).flatMap(
                (target) => {
                    const [path = "", anchor] = target.split("#");
                    const resolved = path ? resolve(dirname(doc), path) : doc;
                    const where = `${basename(doc)} → ${target}`;

                    if (path && !existsSync(resolved)) {
                        return [
                            {
                                check: "links",
                                message: `${where}: no such path`,
                            },
                        ];
                    }

                    if (
                        anchor &&
                        resolved.endsWith(".md") &&
                        !anchorsOf(resolved).has(anchor)
                    ) {
                        return [
                            {
                                check: "links",
                                message: `${where}: no such heading`,
                            },
                        ];
                    }

                    return [];
                },
            );
        });
};
