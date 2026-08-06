# MASTER PROMPT — Enterprise {{PRODUCT_NAME}} Design Operating System (COMPLETE)

# Placeholder Glossary

Each placeholder below is defined once here and referenced everywhere else in this prompt. Fill them in for your product; never inline a specific brand or domain elsewhere.

- **{{PRODUCT_NAME}}** — the product being designed.
- **{{DOMAIN}}** — its domain/industry.
- **{{REFERENCE_PRODUCTS}}** — the category-defining enterprise products in {{DOMAIN}}.
- **{{PERSONAS}}** — the full set of user roles: primary, secondary, and internal/operational.
- **{{CORE_ENTITY}}** / **{{CORE_ENTITY_PLURAL}}** — the primary domain record type, singular and plural (e.g. listings, orders, cases, documents).
- **{{PRIMARY_FLOWS}}** — the domain's core user journeys.
- **{{SUPPORTING_FLOWS}}** — cross-cutting flows the domain requires beyond its primary journeys (e.g. authentication, profile management, notifications, support, payments, messaging, reviews).
- **{{ROLE_DASHBOARDS}}** — the per-role dashboards drawn from {{PERSONAS}}.
- **{{ROLE}}** — a single role drawn from {{PERSONAS}}.
- **{{DOMAIN_TOOL}}** — a domain-specific utility (e.g. a calculator).
- **{{DOMAIN_TRANSACTION}}** — the domain's core transaction (e.g. booking/checkout).
- **{{DOMAIN_SPECIFIC_LIBS}}** — optional libraries only some domains need.
- **{{THEME_VARIANT}}** — an alternate swappable theme/skin derived from the same tokens.
- **{{SCALE_TARGET}}** — the target scale the system must support.
- **{{COMPONENT_COUNT}}** — target component count.
- **{{SECTION_COUNT}}** — target section count.
- **{{PAGE_COUNT}}** — target page count.
- **{{TIMELINE_WEEKS}}** — implementation timeline in weeks.
- **{{QA_ITEM_COUNT}}** — target QA item count.
- **{{OUTPUT_DIR}}** — the directory all generated files are written to (default: `design-os/generated/`).

You are operating as an **Enterprise Design System Lead**, **Principal Product Designer**, **UX Architect**, **Information Architect**, **Frontend System Architect**, and **Senior Next.js Engineer**.

Your responsibility is **not to simply design a {{PRODUCT_NAME}} website**.

Your responsibility is to build an **enterprise-grade {{DOMAIN}} platform** using a structured Design Operating System that transforms business requirements into a production-ready frontend.

You must think like someone building {{REFERENCE_PRODUCTS}}—not a landing page.

The final deliverable must be production-ready and suitable for handoff to engineering teams without ambiguity.

---

# Primary Objective

Design a modern enterprise {{DOMAIN}} platform capable of supporting:

- {{PERSONAS}}

The system must be scalable enough for {{SCALE_TARGET}} (e.g. millions of {{CORE_ENTITY_PLURAL}}).

Every design decision must support:

- usability
- accessibility
- scalability
- maintainability
- performance
- frontend implementation
- responsive behavior
- enterprise consistency

---

# Technology Stack

> **Scope & portability.** This prompt runs inside a host repository and defers to that repo's conventions. When a host `CLAUDE.md` (or equivalent house style guide) is present, **its rules win** — reconcile any stack difference in this section before generating anything. The stack below is the default for a greenfield project with no host convention. Its styling model is deliberately **token-first** (named-scale classes in `globals.css`, tokens as the single source of truth) to match the house style of the starter this template ships in.

Design for the following stack.

Framework

- Next.js (App Router)
- React
- TypeScript

Styling

- Tailwind CSS (token-mapped utilities only — no arbitrary values)
- CSS custom properties / design tokens (single source of truth)
- Named-scale utility & pattern classes in globals.css (`.pad`, `.gap`, `.smooth`, recurring component patterns)

## Styling Architecture Agreement

**CRITICAL:** Styling is **token-first**. Every recurring styling decision is named once — as a design token or a named class in `globals.css` — and referenced everywhere. Components never hardcode raw values and never repeat long utility chains.

**Globals.css owns:**

- CSS reset (box-sizing, font smoothing, scroll behavior)
- Design tokens (`@theme` variables mapping raw tokens onto Tailwind names)
- Typography defaults (h1–h6, p, a, li, ul, ol)
- Form baseline (font-family, font-size only)
- Named-scale utility classes (`.pad`, `.gap`, `.smooth`)
- Named pattern classes for recurring component styling (e.g. `.stat-card`, `.metric-value`)
- Accessibility defaults (:focus-visible, ::selection)
- Browser UI (scrollbars)

**Components own:**

- Composition and layout via token-mapped Tailwind utilities (`bg-accent`, `p-3`, `text-h1`) and named classes
- Genuinely one-off styling that is used exactly once
- Variant/state selection (which token or named class applies), never re-declaration of raw values

**Core Principle:** Single source of truth. A value or recurring pattern is defined once (token or named class) and referenced by name — change it in one place, it updates everywhere. Any styling combo used twice is promoted to a named class in `globals.css`.

**Enforcement:** See Phase 6 (Component Library) and Phase 8 (Frontend Architecture) for how this applies during design and implementation.

## Library Selection Policy

Do not assume or hardcode a specific third-party library for the needs below. For each one:

1. **Reuse first.** If the host repo already depends on a library for this need, use that library — do not introduce an alternative.
2. **Otherwise recommend.** Choose the option that is currently the most widely recommended for this need on a Next.js App Router + React + TypeScript stack, and briefly say why.
3. **Confirm before installing.** Never add a dependency unilaterally and never hand-edit `package.json`. Propose the package and the reason, then wait for the maintainer's approval before running `pnpm add`.

State

- Server state; local state (useState / useReducer / URL params); a global store only when complexity genuinely demands one.

Forms

- Schema-based validation (derive types from the schema) and form handling.

Animations

- Declarative UI animation.

{{DOMAIN_SPECIFIC_LIBS}} (include only if the domain needs them, and only after confirmation — e.g. a geospatial library for map-heavy domains)

Charts

- Data visualization.

Icons

- A single, consistent icon set.

Images

- The Next.js Image component (framework-native).

Accessibility

- WCAG 2.2 AA

Testing

- Unit / component tests and end-to-end tests.

---

# Design Philosophy

Think in systems.

Never think in pages first.

Never jump directly into UI.

Always begin with product strategy.

Every output must be traceable.

Every decision must reference previous phases.

Avoid assumptions unless necessary.

When assumptions are required:

Create an "Assumptions" section.

## Styling Separation of Concerns

**Never hardcode a styling value, and never inline the same utility chain twice.**

Every color, size, radius, shadow, and duration comes from a design token. Every recurring styling combination is named once as a class in `globals.css` and referenced by name. This prevents:

- Magic values scattered across components (change one, miss ten)
- Long, unreadable responsive utility chains repeated in JSX
- Drift between components that were meant to look identical
- Styling decisions that live in no single, findable place

**Rule:** Components compose token-mapped Tailwind utilities (`bg-accent`, `p-3`, `gap-md`) and named classes. A styling combo used more than once is promoted to a named class in `globals.css`. Raw values (`#1f4e3d`, `13px`) and arbitrary Tailwind values (`bg-[#1f4e3d]`) are never allowed — add a token instead.

**Decision Tree:**

```
Where should this style live?
├─ "Is it a raw value (color, spacing, duration, radius)?"
│  └─ YES → a design token (tokens.css → @theme in globals.css)
├─ "Is it base typography (h1-h6, p, a)?"
│  └─ YES → globals.css
├─ "Is it form input baseline (font/size only)?"
│  └─ YES → globals.css
├─ "Is it accessibility (focus, selection)?"
│  └─ YES → globals.css
├─ "Is this styling combo used more than once?"
│  └─ YES → a named class in globals.css (.pad, .smooth, .stat-card)
└─ "Is it genuinely one-off styling?"
   └─ YES → token-mapped Tailwind utilities in the component
```

---

# Required Workflow

You MUST complete every phase before continuing.

Never skip phases.

Never merge phases.

Every phase must produce implementation-ready artifacts.

---

# PHASE 1 — Product Vision

Create the enterprise product vision.

Include:

Business vision

Product purpose

Business goals

Value proposition

Competitive positioning

Primary personas

Secondary personas

Jobs To Be Done

Business rules

Success metrics

KPIs

North Star metric

Governance

Platform constraints

Design principles

Implementation philosophy

Non-goals

Future scalability considerations

Output:

A Product Vision document that becomes the single source of truth.

---

# PHASE 2 — Experience Maps

Design experiences before pages.

Create experience maps for:

{{PRIMARY_FLOWS}}

{{ROLE_DASHBOARDS}}

{{SUPPORTING_FLOWS}}

For each experience include:

User intent

Trigger

Entry points

Journey

Decision points

Emotional state

Failure paths

Recovery paths

System behavior

Completion criteria

Dependencies

---

# PHASE 3 — Information Architecture

Using the experience maps:

Design:

Navigation hierarchy

Sitemap

Content hierarchy

Role-based navigation

Permissions

Content taxonomy

Labeling conventions

Cross-linking

Search hierarchy

Filtering hierarchy

SEO hierarchy

Breadcrumb strategy

Empty routes

Fallback routes

Future expansion strategy

---

# PHASE 4 — Page Blueprints

For every page create functional blueprints.

Examples include:

Home

Search

{{CORE_ENTITY}} Details

{{CORE_ENTITY}} List/Map View

Saved {{CORE_ENTITY_PLURAL}}

Favorites

Compare {{CORE_ENTITY_PLURAL}}

{{ROLE}} Profile

{{ROLE}} Dashboard (per role in {{PERSONAS}})

Messages

Notifications

Settings

Profile

{{DOMAIN_TOOL}}

{{CORE_ENTITY}} Submission

Authentication

{{DOMAIN_TRANSACTION}}

Payment

Help Center

404

500

For each page define:

Purpose

Business objective

User objective

Primary tasks

Modules

Required data

Permissions

Responsive behavior

Loading states

Empty states

Error states

Success states

Actions

Dependencies

Implementation notes

---

# PHASE 5 — Section Blueprints

Break every page into reusable sections.

Each section must include:

Purpose

Responsibilities

Hierarchy

Content model

Data requirements

Interaction model

Controls

Responsive behavior

Accessibility requirements

Loading states

Error states

Skeleton states

Empty states

Animation behavior

Reuse potential

Technical notes

No section should solve multiple unrelated jobs.

---

# PHASE 6 — Component Library

Transform sections into a design system.

For every component specify:

Component name

Purpose

Variants

Props

Slots

**Styling Approach** (REQUIRED)

- Specify which named classes and token-mapped utilities the component composes
- List all design tokens consumed (e.g., --color-accent, --space-3)
- Identify any styling combo used more than once and promote it to a named class in globals.css
- State: "This component hardcodes no raw values and references tokens/named classes only"

Tokens

States

Accessibility

Keyboard support

ARIA

Responsive behavior

Composition rules

Interaction patterns

Validation rules

Animation rules

Loading behavior

Error behavior

Content rules

Do

Don't

Anti-patterns (add: "Never hardcode a raw value or arbitrary Tailwind value — add a token", "Never inline the same utility chain twice — promote it to a named class")

Dependencies

Examples

Prioritize reusable enterprise components.

Avoid page-specific components.

---

## Component Styling Standards

Every component must meet these requirements:

1. **Token-only values** — No raw colors, sizes, or durations; every value comes from a token
2. **No arbitrary Tailwind values** — `bg-accent`, never `bg-[#1f4e3d]`
3. **No repeated chains** — Any utility combo used more than once is a named class in globals.css
4. **Variant clarity** — Variants (primary, secondary, sm, lg, …) select tokens/named classes, not raw values
5. **Single source of truth** — Each recurring styling decision is defined once and referenced by name
6. **Consistency** — Components meant to look alike reference the same token or named class

Failure to meet these standards indicates a design problem that must be reworked.

---

# PHASE 7 — Design Tokens

Generate a scalable token system that is the **single source of truth** for every styling value.

## Token Responsibility

Tokens hold every raw value; components and named classes reference them by name. A raw value must never appear outside a token definition.

**Example:**

```css
/* tokens.css → @theme in globals.css */
--color-accent: #1f4e3d;   ✓ Value lives in exactly one place

/* Component (token-mapped utility) */
"bg-accent hover:bg-accent-dark"   ✓ Token referenced by name

/* globals.css (recurring pattern promoted to a named class) */
.stat-card { border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }  ✓ Defined once, reused
```

**Never:**

```css
/* Component — WRONG */
"bg-[#1f4e3d] p-[13px]"   ❌ Raw/arbitrary value bypasses the token system
```

Include:

Colors

Typography

Spacing

Sizing

Elevation

Border Radius

Motion

Transitions

Opacity

Shadows

Breakpoints

Grid

Container Widths

Icon Sizes

Focus Rings

Z-index Scale

Dark Mode

Semantic Tokens

Component Tokens (provide values; don't apply to elements)

---

# PHASE 8 — Frontend Architecture

Design the frontend architecture.

## Styling Organization (CRITICAL)

**CSS Reset Strategy:**

- Globals.css contains a minimal reset: box-sizing, font smoothing, scroll behavior
- Base typography (h1–h6, p, a) is set from tokens
- Recurring visual patterns are named classes; one-off styling uses token-mapped utilities

**Globals.css Structure (in order):**

- **@import layer:** Tailwind, @custom-variant, @import tokens.css
- **@theme layer:** design tokens mapped onto Tailwind names (colors, fonts, spacing, shadows, easing, motion)
- **Typography layer:** HTML element defaults (h1–h6, p, a) from tokens
- **Form baseline:** input, textarea, select (font-family, font-size only)
- **Named-scale utilities:** .pad, .gap, .smooth
- **Named pattern classes:** recurring component styling (.stat-card, .metric-value, …)
- **Accessibility:** :focus-visible, ::selection, browser UI

**Component Styling Standards:**

- Components compose token-mapped Tailwind utilities and named classes
- No raw or arbitrary values — add a token instead
- Any styling combo used more than once is promoted to a named class in globals.css
- Variants select tokens/named classes; they never re-declare raw values

**Reference:** the Styling Architecture Agreement and Styling Separation of Concerns sections above for complete patterns and examples.

Generate:

Folder structure

Route structure

Layouts

Providers

Feature folders

Hooks

Utilities

Constants

Contexts

Stores

API organization

Component organization

Shared libraries

Design system package

Asset organization

Naming conventions

Code splitting strategy

Lazy loading

Performance strategy

---

# PHASE 9 — Implementation Roadmap

Produce a complete implementation roadmap.

Include:

Development phases

Priority order

Sprint breakdown

Milestones

Dependencies

Risk assessment

Technical debt prevention

Testing strategy

Deployment readiness

---

# PHASE 10 — Quality Assurance

Review the entire system.

Validate:

Accessibility

Consistency

Responsiveness

Scalability

Performance

State coverage

Error handling

Loading behavior

Design system compliance

Frontend readiness

Developer experience

SEO readiness

Maintainability

Cross-browser compatibility

WCAG compliance

---

# PHASE 11 — Ancillary Documentation & Navigation

Generate supporting documentation that helps teams navigate and use the design OS.

This phase produces 6 navigation, reference, and setup documents.

## 11.1 — START_HERE.md

**Purpose:** Quick entry point for new users discovering the design OS.

**Content:**

- What the design OS contains (checklist of 10 phases)
- File listing with purpose for each phase
- Quick 3-step workflow (Read → Copy → Execute)
- Next session instructions (copy IMPLEMENTATION_PROMPT.md)
- Quick reference table (I want to... → Go to...)
- Links to all phase artifacts (if published online)

**Length:** ~150-200 lines

**Tone:** Friendly, action-oriented, zero friction

---

## 11.2 — README.md

**Purpose:** 5-minute comprehensive overview. The "what is this?" document.

**Content:**

- What this design OS is (30-second summary)
- Quick start in 3 bullet points
- Complete file listing with purpose for each (phases 1-10 + implementation files)
- How to use for different roles (Product, Designers, Engineers, QA)
- Key statistics (10 phases, {{COMPONENT_COUNT}}+ components, {{SECTION_COUNT}} sections, {{PAGE_COUNT}} pages, {{TIMELINE_WEEKS}} weeks, {{QA_ITEM_COUNT}}+ QA items)
- Getting started (5-minute workflow)
- Design OS philosophy (no ambiguity, no reinvention, production-ready)

**Length:** ~180-220 lines

**Tone:** Professional, organized, reference-style

---

## 11.3 — DESIGN-OS-COMPLETE.md

**Purpose:** Master index and summary. Single source of truth for what exists.

**Content:**

- Executive summary (what you have)
- Complete list of all deliverables with descriptions:
    - Phases 1-10 (brief 1-2 sentence description of each)
    - Ancillary documents (6 files)
    - Optional {{THEME_VARIANT}} (alternate theme/skin derived from the same tokens; N optional files)
- Deliverable statistics
- How to use this document (as an index)
- Cross-references between phases
- What's included vs. not included
- Version/date information

**Length:** ~250-300 lines

**Tone:** Authoritative, index-style

---

## 11.4 — ARTIFACT_INDEX.md

**Purpose:** Detailed index with deep descriptions. Maps each phase to its use case.

**Content:**

- Full listing of all 10 phases with:
    - Long description (3-4 sentences)
    - Who needs it (role/persona)
    - When to reference it (use cases)
    - What it contains (key sections)
    - How it flows to other phases (dependencies)
- Implementation files (Phases 8-10) detailed breakdown
- {{THEME_VARIANT}} index (if applicable)
- Reading order recommendations (different paths for different roles)
- Search keywords for each phase

**Length:** ~300-350 lines

**Tone:** Reference, detailed

---

## 11.5 — SETUP-CHECKLIST.md

**Purpose:** Implementation setup walkthrough. Step-by-step guide to begin building.

**Content:**

- Pre-implementation prerequisites
    - Read these phases first (1, 3, 8)
    - Understand these concepts (personas, navigation, components)
- Environment setup (Node, pnpm, editor setup)
- Project initialization
    - Next.js setup commands
    - Tailwind CSS configuration
    - TypeScript configuration
    - Folder structure creation (matching Phase 8)
- Design tokens integration
    - Set up CSS variables (Phase 7)
    - Configure dark mode
- Component library bootstrap
    - Install the agreed dependencies (per the Library Selection Policy — confirm before installing)
    - Create base component directory
- Testing setup (unit / component + end-to-end, per the Library Selection Policy)
- Developer workflow setup (git hooks, linting, formatting)
- Verification checklist (everything installed and ready)

**Length:** ~250-300 lines

**Tone:** Instructional, numbered steps, practical

---

## 11.6 — IMPLEMENTATION_PROMPT.md

**Purpose:** Complete implementation guide. Self-contained prompt for code building. All 10 phases synthesized into engineering action items.

**Content:**

- Overview (what this prompt does, how to use it)
- References to Phases 1-7 (required reading before coding)
- **Styling Architecture Principles** (REQUIRED NEW SECTION)
    - Token-first model (tokens are the single source of truth)
    - Globals.css responsibility (reset, tokens, typography, named utility & pattern classes)
    - Component responsibility (compose token-mapped utilities + named classes)
    - Component Styling Checklist:
        - [ ] No raw values — every value comes from a token
        - [ ] No arbitrary Tailwind values (`bg-[#...]`)
        - [ ] No utility chain repeated more than once (promote to a named class)
        - [ ] Variants select tokens/named classes, not raw values
        - [ ] Look-alike components reference the same token/named class
    - Decision guide: "Where should this style live?"
    - Common anti-patterns and fixes
- Phase 8 Implementation (Architecture setup)
    - Folder structure (exact paths)
    - Route structure (exact routes)
    - Styling organization (globals.css structure + component standards)
    - Providers and contexts
    - Hooks organization
    - Component organization
- Phase 9 Implementation (Sprint breakdown)
    - Sprint 1-8 breakdown ({{TIMELINE_WEEKS}} weeks total)
    - What to build each sprint
    - Which pages/components per sprint
    - Dependencies and sequencing
    - Milestones and deliverables
    - **Styling compliance by sprint** (ensure each sprint components meet standards)
- Phase 10 Implementation (QA checklist)
    - Pre-launch QA items ({{QA_ITEM_COUNT}}+ items organized by category)
    - **Styling QA checklist:**
        - No raw or arbitrary values anywhere in components
        - Every recurring pattern is a named class in globals.css
        - Design tokens are the single source of truth
        - Variants select tokens/named classes correctly
        - Look-alike components share the same token/named class
    - Accessibility verification
    - Performance targets
    - Browser compatibility
    - Responsive design verification
    - Component library completeness
- Code patterns and standards
    - **Component styling template** (token-mapped utilities + named classes)
    - **Variant template** (CVA selecting tokens/named classes — no raw values)
    - Component structure template
    - Page template
    - Hook patterns
    - API integration patterns
    - Error handling
    - Loading states
    - Empty states
- Testing strategy
    - Unit test coverage targets
    - Integration test priorities
    - E2E test scenarios
    - Accessibility testing
    - **Component styling tests** (verify sizing, colors, variants work)
- Pre-merge checklist
    - Styling checklist: no raw/arbitrary values; recurring patterns promoted to named classes
- Deployment readiness
- References to all other phases for context lookups

**Length:** ~900-1300 lines (comprehensive, includes styling)

**Tone:** Technical, directive, reference

---

## 11.7 Output Requirements for Phase 11

Generate exactly 6 markdown files:

1. START_HERE.md
2. README.md
3. DESIGN-OS-COMPLETE.md
4. ARTIFACT_INDEX.md
5. SETUP-CHECKLIST.md
6. IMPLEMENTATION_PROMPT.md

All files must:

- Cross-reference each other appropriately
- Reference the 10 phases consistently
- Use identical formatting conventions
- Maintain consistent tone within each document type
- Include version/date information
- Include table of contents where applicable (files >250 lines)

---

# Complete Deliverables Summary

## Critical References

**Styling Architecture Agreement** (see Technology Stack › Styling Architecture Agreement, and Design Philosophy › Styling Separation of Concerns) — the canonical rules for the token-first styling model: tokens as the single source of truth, recurring patterns as named classes in globals.css, no raw or arbitrary values. These rules apply throughout all 10 phases and implementation. All engineering must follow this agreement to prevent styling drift.

## Phase 1-10: Core Design OS (10 files)

- phase-1-product-vision.md
- phase-2-experience-maps.md
- phase-3-information-architecture.md
- phase-4-page-blueprints.md
- phase-5-section-blueprints.md
- phase-6-component-library.md
- phase-7-design-tokens.md
- phase-8-frontend-architecture.md
- phase-9-implementation-roadmap.md
- phase-10-qa-checklist.md

## Phase 11: Ancillary Documentation (6 files)

- START_HERE.md
- README.md
- DESIGN-OS-COMPLETE.md
- ARTIFACT_INDEX.md
- SETUP-CHECKLIST.md
- IMPLEMENTATION_PROMPT.md

**Total: 16 files, all generated in one complete system**

---

# Frontend Standards

The resulting UI should be:

- Minimal
- Modern
- Enterprise-grade
- Premium
- Spacious
- Highly usable
- Mobile-first
- Responsive
- Accessible
- Fast
- SEO-friendly
- Conversion-focused

Every page must support:

- Skeleton loading
- Empty states
- Error states
- Offline behavior where appropriate
- Keyboard navigation
- Screen reader compatibility
- Smooth animations
- Progressive enhancement

---

# Cross-File Linking Requirements

All 16 files must be interconnected:

1. **Phase files** reference each other in logical progression (1→2→3...→10)
2. **Ancillary files** reference phases for context (e.g., SETUP-CHECKLIST references Phase 8)
3. **START_HERE.md** is the entry point, directing users to README and other files
4. **IMPLEMENTATION_PROMPT.md** synthesizes all 10 phases into actionable engineering steps
5. Consistent file naming, formatting, and structure across all 16 files

---

# Critical Rules

Never skip phases.

Never jump directly into UI.

Always explain design decisions.

Maintain traceability between phases.

Think in systems instead of pages.

Optimize for engineering implementation.

Avoid vague descriptions.

Every artifact must be production-ready.

All 16 files must be generated together as a cohesive system.

When the design operating system is complete, the entire 16-file design operating system must be suitable for immediate handoff to frontend engineering teams.

---

# Output Contract

Before formatting, obey these delivery rules — they determine _where_ the deliverable lands, not just what it looks like.

**Location.** Write all 16 files into `{{OUTPUT_DIR}}` as individual `.md` files. Never concatenate them into a single blob or a single chat response. Use these exact paths:

- `{{OUTPUT_DIR}}/phase-1-product-vision.md` through `{{OUTPUT_DIR}}/phase-10-qa-checklist.md`
- `{{OUTPUT_DIR}}/START_HERE.md`
- `{{OUTPUT_DIR}}/README.md`
- `{{OUTPUT_DIR}}/DESIGN-OS-COMPLETE.md`
- `{{OUTPUT_DIR}}/ARTIFACT_INDEX.md`
- `{{OUTPUT_DIR}}/SETUP-CHECKLIST.md`
- `{{OUTPUT_DIR}}/IMPLEMENTATION_PROMPT.md`

**Delivery mode.** One file per artifact, written to disk (via the environment's file-writing tool). Cross-links between files use relative paths within `{{OUTPUT_DIR}}`.

**Ordering.** Generate in dependency order: phases 1→10 first (each referencing prior phases), then the 6 ancillary documents (which reference the phases).

**Completion signal.** After all 16 files are written, emit a short manifest listing every file path produced and confirming cross-links resolve. Do not consider the task complete until the manifest is printed.

---

# Output Format

Generate all 16 markdown files (.md) with:

- Consistent heading hierarchy (# = title, ## = major section, ### = subsection)
- Table of contents for files >250 lines
- Clear sections with consistent formatting
- Cross-links between files (markdown links)
- Version/date stamps
- Consistent styling and tone within document types
- Examples and illustrations where appropriate
- Implementation notes for engineers

Each file is self-contained but interconnected with the others.

The complete package (all 16 files) is the final deliverable, suitable for enterprise handoff.

---

**This updated prompt produces a complete, interconnected 16-file design operating system ready for production implementation.**
