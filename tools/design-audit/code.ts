import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const isTest = (path: string): boolean => /\.test\.tsx?$/.test(path);

export const walk = (dir: string): string[] => {
    if (!existsSync(dir)) return [];

    return readdirSync(dir).flatMap((entry) => {
        const path = join(dir, entry);

        return statSync(path).isDirectory() ? walk(path) : [path];
    });
};

export const views = (dir: string): string[] =>
    walk(dir).filter((path) => path.endsWith(".tsx") && !isTest(path));

export const stem = (path: string): string => basename(path, ".tsx");

export const routeOf = (appDir: string, page: string): string =>
    "/" +
    relative(appDir, page)
        .split(/[\\/]/)
        .slice(0, -1)
        .filter((segment) => !/^\(.*\)$/.test(segment))
        .join("/");

export const routes = (appDir: string): string[] =>
    walk(appDir)
        .filter((path) => basename(path) === "page.tsx")
        .map((page) => routeOf(appDir, page));

const HOOK_EXPORT = /export const (use[A-Z]\w*)/g;

export const queryHooks = (sources: string[]): Set<string> => {
    const found = new Set<string>();

    for (const source of sources) {
        const starts = [...source.matchAll(HOOK_EXPORT)];

        starts.forEach((match, index) => {
            const body = source.slice(
                match.index,
                starts[index + 1]?.index ?? source.length,
            );

            if (match[1] && /\buseQuery\(/.test(body)) found.add(match[1]);
        });
    }

    return found;
};

const HOOK_IMPORT =
    /import\s*\{([^}]+)\}\s*from\s*["']@\/lib\/hooks\/[^"']+["']/g;

export const importedHooks = (source: string): string[] =>
    [...source.matchAll(HOOK_IMPORT)].flatMap((match) =>
        (match[1] ?? "")
            .split(",")
            .map((name) => name.trim().replace(/^type\s+/, ""))
            .filter(Boolean),
    );

export const hookSources = (hooksDir: string): string[] =>
    walk(hooksDir)
        .filter((path) => path.endsWith(".ts") && !isTest(path))
        .map((path) => readFileSync(path, "utf8"));
