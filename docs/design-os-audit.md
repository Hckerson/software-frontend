# Design OS — Conformance Audit

Audited 2026-09-20 against `development` @ `6d370a6` plus the working tree.
**Closed 2026-09-21: every finding is resolved.** A re-run of the audit reports zero findings.

Filed beside `design-os/` rather than inside it. This is not a phase document, and
[04](design-os/04-roadmap-and-qa.md#deviation-from-the-master-prompt) warns that the
directory's arithmetic stops holding past roughly twelve files.

## Method

Four independent checks, each mechanical rather than read-by-eye:

1. **Inventory diff** — every route, section, component, hook and lint rule the documents
   name, diffed both ways against the filesystem.
2. **Contract conformance** — each layer checked against the contract its own document
   states: the state ladder, `"use client"`, no transport import, the 150-line ceiling,
   `ConfirmDialog` on destructive writes, no breakpoint chains in JSX.
3. **Referential integrity** — every relative link and `#anchor` in the nine documents
   resolved against real files and real headings.
4. **Ground truth** — the repo's own gates run, because
   [04](design-os/04-roadmap-and-qa.md#qa-checklist) makes numeric claims about them.

The heuristic pass produced 15 raw findings. Each was then read in source; three were false
positives (`placeholder` as an input prop, not a stub marker) and four were justified
absences, which are now named in the section contract so a re-run cannot raise them again.

## Verdict

**Everything the documents specify is built**, and after this pass everything built is
documented. All four gates are green.

| Asserted          | Documented | Built  | Result                       |
| ----------------- | ---------- | ------ | ---------------------------- |
| Routes            | 16 + 2     | 16 + 2 | ✅                           |
| Sections          | 38         | 38     | ✅ reconciled                |
| Components        | 33         | 33     | ✅ 16 / 6 / 9 / 2, exact     |
| Hooks named       | 35         | 35     | ✅ 5 orphans, all documented |
| Custom lint rules | 7          | 7      | ✅                           |
| `lint`            | 0          | 0      | ✅ incl. the 7 custom rules  |
| `type-check`      | 0          | 0      | ✅                           |
| `test`            | —          | 185    | ✅ 23 files                  |
| `build`           | 17 routes  | 17     | ✅                           |

The gaps ran the other direction: **code had outrun the documents**, and three sections
skipped a rung of the ladder their own contract calls mandatory.

---

## 1 · The error rung was missing on three sections — real defects · **fixed**

[06](design-os/06-section-blueprints.md#the-section-contract) states the ladder and that
"skipping a rung is a defect." Three sections skipped one, and in each the failure rendered as
a **confident factual claim about billing** rather than as an error.

| Section                                                                    | Was missing | What a failed request used to render                     |
| -------------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| [plan-summary.tsx](../components/sections/dashboard/plan-summary.tsx)      | error       | _"No active plan · Browse plans"_ — to a paying customer |
| [next-invoice.tsx](../components/sections/dashboard/next-invoice.tsx)      | error       | _"Nothing due yet"_ — when nothing is known              |
| [account-details.tsx](../components/sections/settings/account-details.tsx) | error       | a silent blank panel, no message, no retry               |

All three shared one shape: the hook was destructured without `isError`, so
`!isPending && !data` caught the error case and routed it into the empty state.

**Fixed** by adding the error rung to each, and by correcting the two blueprints whose compose
lists omitted `ErrorState` — document and code had agreed with each other and both disagreed
with the contract, which is why neither lint nor review caught it. `next-invoice` reads two
queries, so either failing now renders `ErrorState`.

### Justified absences — now named in the contract

Four sections omit the **empty** rung for a stated reason. They were correct; the section
contract now lists them, so an audit does not re-raise them: `invoice-detail` (a `403` must
render as an error, never as an empty invoice), `profile-form` and `account-details`
(`GET /users/me` cannot return nothing on an authenticated route), `admin-overview` and
`admin-invoice-health` (a counter is always present, zero included).

**Nothing omits the error rung.** That is the rule the contract now states outright.

---

## 2 · Two sections were built without a blueprint · **fixed**

`cycle-run-report` (committed, composed by `admin-cycle-controls`, named in prose but absent
from the table) and `plan-metric-fields` (untracked, composed by `admin-plan-form`, absent
entirely). Both are legitimate one-job extractions; the blueprint table had not caught up.

Both are now blueprinted, and the arithmetic that depended on them is reconciled:

- `admin/` heading **8 → 11 sections**, and the contents list's dead `#admin--6-sections`
  anchor — which carried a third, older count — now resolves.
- README **36 → 38 sections**.
- The [reuse graph](design-os/06-section-blueprints.md#reuse-graph) showed 10 edges against a
  real import graph of 13; it now states **15**, matching the graph derived from the imports.
- `dashboard/ — 3 sections` was followed by four blueprints. The heading is unchanged (it is a
  link target); the `usage-summary` blueprint now says in its own title that it lives in
  `usage/` and is blueprinted there only because `/dashboard` composes it first.

---

## 3 · Two capabilities were documented but not built · **one built, one deferred on the record**

Each had a **working hook with no surface to call it**, which is why type-check and lint stayed
silent.

**Plan editing — built.** [E5](design-os/01-information-architecture.md#e5--administer-the-catalog-billing-admin)
promised admins could "create, **edit price and limits**, activate/deactivate", but
`admin-plan-form` was create-only and `useUpdatePlan` was orphaned. The new
[`admin-plan-edit`](../components/sections/admin/admin-plan-edit.tsx) section is a dialog over
`admin-plan-list`, mounted only while a row is selected and keyed by plan id so its fields seed
from props with no reset effect — the same pattern as `profile-fields`. It reuses
`plan-metric-fields`, so the create and edit forms cannot describe a limit differently. It does
**not** confirm: editing is reversible and does not cascade, while its neighbours (deactivate,
delete) are irreversible and do. A `toDraft` helper and four tests were added to
[`plan-draft.ts`](../lib/utils/plan-draft.ts) for the plan→form direction.

**The add-card form — deliberately deferred.** [Phase D4](design-os/05-billing-cycle-plan.md#phase-d--payment-methods)
promised "`PaymentMethodList` + add form". `useAddPaymentMethod` and `POST /payment-methods`
both work; the missing piece is the UI, because a form that invents a placeholder token would
tell a customer their card is on file when nothing was tokenised — which is 05's own argument,
now stated as the reason rather than left as a gap. D4 also named components that do not match
what was built; it now names `payment-methods` and `payment-method-row`. **Build the form in
the same change as Stripe, not before.**

Remaining orphans, all deliberate: `useAddPaymentMethod` (above), and `usePlan`,
`useUsageLimit`, `useUsageLimits`, `useCreateUser` — generated contract surface with no
blueprint behind it, consistent with [04's gap #3](design-os/04-roadmap-and-qa.md#known-gaps-ranked).

---

## 4 · The permissions model was documented as the opposite of what it is · **fixed**

**The highest-value correction in this audit**, because
[01](design-os/01-information-architecture.md) is the document a reader is sent to "when you
are adding a route, a nav item, or a permission," and because the subject is security.

It stated:

> Route protection is client-side today: `session.isActive()` gates the `(app)` layout and
> `role` gates `/admin/*`. The JWT lives in `localStorage` … `proxy.ts` cannot enforce this —
> see Frontend Architecture for the httpOnly-cookie migration this is deliberately staged
> behind.

Every clause was false, and verified so:

- `app/(app)/layout.tsx` renders `AppShell` and gates nothing. No `session.isActive()` exists
  anywhere in the repo.
- `localStorage` appears in exactly one place, `lib/utils/theme.ts`, for the theme preference.
  No token is stored client-side.
- `proxy.ts` reads the httpOnly cookie and verifies an **RS256** signature before render.

The migration it called "deliberately staged behind" had been delivered — stages 6 and 7 of
[04's own table](design-os/04-roadmap-and-qa.md#delivered-in-this-pass) — and both
[02](design-os/02-page-blueprints.md#the-page-contract) and
[03](design-os/03-frontend-architecture.md#authentication-boundary) already described the new
model correctly. **§ Permissions is rewritten** to match `proxy.ts`: server-side enforcement,
fail-closed behaviour, `AppShell`'s `role` read as navigation rather than authorisation, and
the backend as the standing authority.

---

## 5 · Smaller staleness · **fixed**

| Where                                       | Was                                                                                                                                                                                                                                | Now                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [03](design-os/03-frontend-architecture.md) | The folder map listed `layout/ Sidebar, **SidebarNav**, Topbar`. `SidebarNav` existed nowhere; the file is `sidebar-group.tsx`. The block also omitted `AppShell`, `ThemeToggle`, `AuthCard` and 3 of the 16 `common/` components. | All six layout components named correctly; all sixteen `common/` components listed. |
| [05](design-os/05-billing-cycle-plan.md)    | "except the **four** dependency-gated items listed under [Still gated](#still-gated)" — dead anchor, wrong count, and "except" inverted the status of three delivered items.                                                       | Points at the real heading, says three, and states they are approved and built.     |
| [06](design-os/06-section-blueprints.md)    | Dead anchor `#admin--6-sections`.                                                                                                                                                                                                  | Resolves (see §2).                                                                  |

Those were the only two dead anchors and the only nonexistent path across all nine documents.
A re-run confirms every relative link and anchor now resolves.

---

## 6 · Overage · **closed in parallel**

The audit flagged that the working tree was closing
[04's largest known gap](design-os/04-roadmap-and-qa.md#known-gaps-ranked) — `overageRates`
flowing end to end through types, `lib/utils/usage.ts`, the catalogue, the landing preview,
`next-invoice` and the admin plan form — while 00, 04 and 05 all still recorded option 1
("no overage") as the standing decision.

**Resolved by the author during this pass**, not by this audit: 05 now records option 2 as
taken, explains that a metric with a rate bills the excess while a metric without one stays a
hard cap — making option 2 a superset rather than a replacement — and 00 and 04 agree. The
frontend half is built; the backend half (passing the real rate to `calculateOverageCharge`,
and `POST /usage/track` no longer rejecting a metric that carries one) is what remains.

---

## Re-run

The audit is a script, not a reading. Re-running it against the current tree reports:

```
0 findings
routes: 16 | sections: 38
{admin:11, auth:4, dashboard:3, invoices:3, landing:2,
 plans:3, settings:5, subscription:4, usage:3}
```

Gates: `lint` 0 · `type-check` 0 · `test` 185 in 23 files · `build` 17 routes.

**What the audit cannot see**, and what the next pass should cover: the backend overage wiring
above; `test:e2e`, which needs a running stack and was not exercised here; and whether
`ConfirmDialog` actually restores focus to its trigger, which
[07](design-os/07-component-library.md) claims and which no test asserts.
