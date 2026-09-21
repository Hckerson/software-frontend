export interface Block {
    folders: string[];
    claimed: number;
    names: string[];
}

export const SECTION_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
export const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]+$/;

const FOLDER_HEADING = /^## (.+?) — (\d+) \w+/;
const TABLE_LEAD = /^\| `([^`]+)` +\|/;
const BOLD_LEAD = /^(?:- )?\*\*`([^`]+)`\*\*/;
const TICKED = /`([^`]+)`/g;

const ticked = (text: string): string[] =>
    [...text.matchAll(TICKED)].map((match) => match[1] ?? "");

const introduced = (line: string): string[] => {
    if (line.startsWith("### ")) {
        return ticked(line.slice(4).split(" — ")[0] ?? "");
    }

    const lead = TABLE_LEAD.exec(line) ?? BOLD_LEAD.exec(line);

    return lead?.[1] ? [lead[1]] : [];
};

export const folderBlocks = (markdown: string, grammar: RegExp): Block[] => {
    const blocks: Block[] = [];
    let current: Block | null = null;

    for (const line of markdown.split("\n")) {
        const heading = FOLDER_HEADING.exec(line);

        if (heading) {
            current = {
                folders: ticked(heading[1] ?? "")
                    .filter((token) => token.endsWith("/"))
                    .map((token) => token.slice(0, -1)),
                claimed: Number(heading[2]),
                names: [],
            };
            blocks.push(current);
            continue;
        }

        if (line.startsWith("## ")) {
            current = null;
            continue;
        }

        if (!current) continue;

        for (const name of introduced(line)) {
            if (grammar.test(name) && !current.names.includes(name)) {
                current.names.push(name);
            }
        }
    }

    return blocks;
};

export const sitemapRoutes = (markdown: string): string[] => {
    const start = markdown.indexOf("## Sitemap");

    if (start === -1) return [];

    const fence = markdown.indexOf("```", start);
    const end = markdown.indexOf("```", fence + 3);

    return markdown
        .slice(fence + 3, end)
        .split("\n")
        .map((line) => /^(\/\S*)/.exec(line)?.[1])
        .filter((route): route is string => Boolean(route));
};

export const claimedCount = (markdown: string, unit: string): number | null => {
    const match = new RegExp(String.raw`\*\*(\d+) ${unit}\*\*`).exec(markdown);

    return match ? Number(match[1]) : null;
};

export const slug = (heading: string): string =>
    heading
        .replace(/[`*_]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/ /g, "-");

export const headingSlugs = (markdown: string): Set<string> =>
    new Set(
        markdown
            .split("\n")
            .filter((line) => /^#{1,6} /.test(line))
            .map((line) => slug(line.replace(/^#+ /, ""))),
    );

export const relativeLinks = (markdown: string): string[] =>
    [...markdown.matchAll(/\]\(([^)\s]+)\)/g)]
        .map((match) => match[1] ?? "")
        .filter((target) => !/^(https?|mailto):/.test(target));
