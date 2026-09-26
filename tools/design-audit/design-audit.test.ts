import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkErrorRung, checkSections } from "@/tools/design-audit/checks";
import { importedHooks, queryHooks, routeOf } from "@/tools/design-audit/code";
import {
    checkComponents,
    fileName,
} from "@/tools/design-audit/component-checks";
import {
    COMPONENT_NAME,
    SECTION_NAME,
    claimedCount,
    folderBlocks,
    sitemapRoutes,
    slug,
} from "@/tools/design-audit/docs";
import { checkLinks } from "@/tools/design-audit/links";
import type { Documents, Inventory } from "@/tools/design-audit/types";

const SECTIONS_DOC = [
    "## The section contract",
    "### `not-a-section`",
    "## `dashboard/` — 2 sections",
    "### `usage-summary` — _lives in `usage/`; see `plan-card`_",
    "### `plan-summary`",
    "## `admin/` — 2 sections",
    "| Section | Job |",
    "| `admin-overview` | Health |",
    "- **`admin-plan-form`** — create a plan",
    "## Reuse graph",
    "**`orphan-note`** is prose outside any folder",
].join("\n");

const docsWith = (overrides: Partial<Documents>): Documents => ({
    readme: "",
    architecture: "",
    sections: SECTIONS_DOC,
    components: "",
    ...overrides,
});

const inventoryWith = (overrides: Partial<Inventory>): Inventory => ({
    routes: [],
    fallbacks: {},
    sectionFiles: {},
    componentFiles: {},
    queryReaders: [],
    errorRenderers: [],
    ...overrides,
});

describe("folderBlocks", () => {
    const blocks = folderBlocks(SECTIONS_DOC, SECTION_NAME);

    it("reads each folder heading's claimed count", () => {
        expect(blocks.map((b) => [b.folders, b.claimed])).toEqual([
            [["dashboard"], 2],
            [["admin"], 2],
        ]);
    });

    it("takes names from headings, table leads and bold leads", () => {
        expect(blocks[1]?.names).toEqual(["admin-overview", "admin-plan-form"]);
    });

    it("ignores names a heading mentions after its dash", () => {
        expect(blocks[0]?.names).toEqual(["usage-summary", "plan-summary"]);
    });

    it("ignores names outside a folder block", () => {
        const names = blocks.flatMap((b) => b.names);

        expect(names).not.toContain("not-a-section");
        expect(names).not.toContain("orphan-note");
    });

    it("reads several names from one heading and several folders", () => {
        const [block] = folderBlocks(
            "## `providers/` & `wrappers/` — 2 components\n### `Topbar` · `AuthCard`",
            COMPONENT_NAME,
        );

        expect(block?.folders).toEqual(["providers", "wrappers"]);
        expect(block?.names).toEqual(["Topbar", "AuthCard"]);
    });
});

describe("document parsers", () => {
    it("reads sitemap routes from the fenced block only", () => {
        const doc =
            "/stray\n## Sitemap\n\n```\n/    Landing\n/admin/plans  CRUD\n```\n/after";

        expect(sitemapRoutes(doc)).toEqual(["/", "/admin/plans"]);
    });

    it("reads a README count, or null when it is absent", () => {
        expect(
            claimedCount("**17 routes** · **44 sections**", "sections"),
        ).toBe(44);
        expect(claimedCount("no counts here", "routes")).toBeNull();
    });

    it("slugs headings the way the docs' own anchors expect", () => {
        expect(slug("`common/` — 16 components")).toBe("common--16-components");
        expect(slug("`ui/forms/` — 9 primitives")).toBe(
            "uiforms--9-primitives",
        );
    });

    it("maps a component name onto its file name", () => {
        expect(fileName("CheckBoxInput")).toBe("check-box-input");
        expect(fileName("UsageMeter")).toBe("usage-meter");
    });
});

describe("code parsers", () => {
    it("strips route groups and handles either path separator", () => {
        expect(
            routeOf("app", join("app", "(app)", "admin", "plans", "page.tsx")),
        ).toBe("/admin/plans");
        expect(routeOf("app", join("app", "page.tsx"))).toBe("/");
    });

    it("classifies a hook by what its own body calls", () => {
        const source = [
            "export const usePlans = () => useQuery({ queryKey: [] });",
            "export const useDeletePlan = () => useMutation({ mutationFn });",
        ].join("\n");

        expect([...queryHooks([source])]).toEqual(["usePlans"]);
    });

    it("reads multi-line and type-only hook imports", () => {
        const source =
            'import {\n    usePlans,\n    type PlanKey,\n} from "@/lib/hooks/use-plans";';

        expect(importedHooks(source)).toEqual(["usePlans", "PlanKey"]);
    });
});

describe("checks", () => {
    it("reports a count mismatch and drift in both directions", () => {
        const findings = checkSections(
            docsWith({}),
            inventoryWith({
                sectionFiles: {
                    dashboard: ["plan-summary", "recent-invoices", "extra"],
                    usage: ["usage-summary"],
                    admin: ["admin-overview"],
                },
            }),
        ).map((f) => f.message);

        expect(findings).toContain(
            "06 says dashboard/ has 2 sections; it holds 3",
        );
        expect(findings).toContain(
            "recent-invoices is built but has no blueprint in 06",
        );
        expect(findings).toContain(
            "admin-plan-form is blueprinted in 06 but has no file",
        );
        expect(findings).toContain(
            "components/sections/usage/ has no heading in 06",
        );
        expect(findings.join()).not.toContain("usage-summary is");
    });

    it("counts a two-folder component block across both folders", () => {
        const findings = checkComponents(
            docsWith({
                components:
                    "## `providers/` & `wrappers/` — 2 components\n**`Provider`** — q\n**`MotionWrapper`** — m",
            }),
            inventoryWith({
                componentFiles: {
                    providers: ["provider"],
                    wrappers: ["motion-wrapper"],
                },
            }),
        );

        expect(findings).toEqual([]);
    });

    it("flags only readers of a query hook that never render ErrorState", () => {
        const findings = checkErrorRung(
            inventoryWith({
                queryReaders: ["landing-plans", "plan-summary"],
                errorRenderers: ["plan-summary"],
            }),
        );

        expect(findings.map((f) => f.message)).toEqual([
            "landing-plans reads a query hook but never renders ErrorState",
        ]);
    });

    it("reports a dead path and a dead anchor, and accepts a live one", () => {
        const dir = mkdtempSync(join(tmpdir(), "design-audit-"));
        mkdirSync(join(dir, "sub"));
        writeFileSync(join(dir, "a.md"), "# Real heading\n[ok](#real-heading)");
        writeFileSync(
            join(dir, "b.md"),
            "[gone](missing.md) [bad](a.md#nope) [good](a.md#real-heading) [dir](sub)",
        );

        expect(checkLinks(dir).map((f) => f.message)).toEqual([
            "b.md → missing.md: no such path",
            "b.md → a.md#nope: no such heading",
        ]);
    });
});
