# MASTER PROMPT — Enterprise {{PRODUCT_NAME}} Design Operating System (COMPLETE)

# Placeholder Glossary

Each placeholder below is defined once here and referenced everywhere else in this prompt. Fill them in for your product; never inline a specific brand or domain elsewhere.

- **{{PRODUCT_NAME}}** — the product being designed.
- **{{DOMAIN}}** — its domain/industry.
- **{{REFERENCE_PRODUCTS}}** — the category-defining products in {{DOMAIN}}, used as benchmarks for features and flows only — never for look or feel.
- **{{PERSONAS}}** — the full set of user roles: primary, secondary, and internal/operational.
- **{{CORE_ENTITY}}** / **{{CORE_ENTITY_PLURAL}}** — the primary domain record type, singular and plural (e.g. listings, orders, cases, documents).
- **{{PRIMARY_FLOWS}}** — the domain's core user journeys.
- **{{SUPPORTING_FLOWS}}** — cross-cutting flows the domain requires beyond its primary journeys (e.g. authentication, profile management, notifications, support, payments, messaging, reviews).
- **{{ROLE_DASHBOARDS}}** — the per-role dashboards drawn from {{PERSONAS}}.
- **{{ROLE}}** — a single role drawn from {{PERSONAS}}.
- **{{DOMAIN_TOOL}}** — a domain-specific utility (e.g. a calculator).
- **{{DOMAIN_TRANSACTION}}** — the domain's core transaction (e.g. booking/checkout).
- **{{DOMAIN_SPECIFIC_LIBS}}** — optional libraries only some domains need.
- **{{SCALE_TARGET}}** — the target scale the system must support.
- **{{COMPONENT_COUNT}}** — target component count.
- **{{SECTION_COUNT}}** — target section count.
- **{{PAGE_COUNT}}** — target page count.
- **{{TIMELINE_WEEKS}}** — implementation timeline in weeks.
- **{{QA_ITEM_COUNT}}** — target QA item count.
- **{{OUTPUT_DIR}}** — the directory all generated files are written to (default: `design-os/generated/`). The seed prompt itself lives in `docs/`; `design-os/` holds generated output only.

You are operating as a **Product Strategist**, **UX Architect**, **Information Architect**, **Frontend System Architect**, and **Senior Next.js Engineer**.

Your responsibility is to define an **enterprise-grade {{DOMAIN}} platform** using a structured Design Operating System that transforms business requirements into an unambiguous specification of what the product does: its users, flows, information, content, data, behaviour and architecture.

Benchmark features and flows against {{REFERENCE_PRODUCTS}}.

**This design OS never decides how anything looks.** Visual design (colour, type, layout, placement, imagery, motion) is decided when each page is built, with the owner. See Critical Rules › No Visual Prescription.

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

> **Scope & portability.** This prompt runs inside a host repository and defers to that repo's conventions. When a host `CLAUDE.md` (or equivalent house style guide) is present, **its rules win** — reconcile any stack difference in this section before generating anything. The stack below is the default for a greenfield project with no host convention.

Design for the following stack.

Framework

- Next.js (App Router)
- React
- TypeScript

Styling

- Tailwind CSS and the host repo's token system. How styles are written is governed by the host repo's conventions; what anything looks like is decided at build time. This prompt makes no styling decisions.

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

Product principles (how the product behaves and treats its users; no visual decisions)

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

Content requirements (the information and actions the page must offer, in priority order; never layout, placement or module names that imply a layout)

Required data

Permissions

Device needs (what users on each device need to do; never layout)

Loading states

Empty states

Error states

Success states

Actions

Dependencies

Implementation notes

---

# PHASE 5 — Section Blueprints

Break every page into sections by the job each one does.

Each section must include:

Purpose

Responsibilities

Content model

Data requirements

Interaction model

Controls

Device needs

Accessibility requirements

Loading states

Error states

Empty states

Reuse potential

Technical notes

No section should solve multiple unrelated jobs.

Describe content and behaviour only. Never specify layout, order on screen, sizing, imagery, animation or wireframes.

---

# PHASE 6 — Interaction Contracts

Define how every interactive element behaves. Contracts describe behaviour, never appearance. Which components exist, how they are grouped and how they look is decided when pages are built.

For every interactive element specify:

Name

Purpose

Inputs (the data it takes)

States

Accessibility

Keyboard support

ARIA

Interaction patterns

Validation rules

Loading behavior

Error behavior

Content rules

Do

Don't

Dependencies

---

# PHASE 7 — Frontend Architecture

Design the frontend architecture. Styling organisation follows the host repo's conventions and is not specified here.

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

Asset organization

Naming conventions

Code splitting strategy

Lazy loading

Performance strategy

---

# PHASE 8 — Implementation Roadmap

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

Per-feature build status (see Build Status Vocabulary below)

## Build Status Vocabulary

Every page, section, interaction contract and flow specified in Phases 1–7 appears in the roadmap carrying exactly one status drawn from this fixed set:

- **Specified** — defined in the blueprints, not yet scheduled.
- **Scheduled** — assigned to a sprint or milestone.
- **In progress** — implementation started.
- **Built** — implemented and merged.
- **Verified** — implemented and passing the Phase 9 checks.
- **Deferred** — deliberately postponed. Carries a reason and a revisit trigger (a date, a milestone, or a dependency).

Status lives here and nowhere else. It is recorded against a feature, never used to remove one — see Critical Rules › Scope Preservation. A feature with no implementation is **Specified**, not absent.

---

# PHASE 9 — Quality Assurance

Review the entire system. QA here is functional; visual quality is judged when each page is built.

Validate:

Accessibility

Behavioural consistency (the same action works the same way everywhere)

Responsiveness

Scalability

Performance

State coverage

Error handling

Loading behavior

Frontend readiness

Developer experience

SEO readiness

Maintainability

Cross-browser compatibility

WCAG compliance

---

# PHASE 10 — Ancillary Documentation & Navigation

Generate supporting documentation that helps teams navigate and use the design OS.

This phase produces 6 navigation, reference, and setup documents.

## 10.1 — START_HERE.md

**Purpose:** Quick entry point for new users discovering the design OS.

**Content:**

- What the design OS contains (checklist of 9 phases)
- File listing with purpose for each phase
- Quick 3-step workflow (Read → Copy → Execute)
- Next session instructions (copy IMPLEMENTATION_PROMPT.md)
- Quick reference table (I want to... → Go to...)
- Links to all phase artifacts (if published online)

**Length:** ~150-200 lines

**Tone:** Friendly, action-oriented, zero friction

---

## 10.2 — README.md

**Purpose:** 5-minute comprehensive overview. The "what is this?" document.

**Content:**

- What this design OS is (30-second summary), including that it defines what the product does and leaves how it looks to the build
- Quick start in 3 bullet points
- Complete file listing with purpose for each (phases 1-9 + implementation files)
- How to use for different roles (Product, Designers, Engineers, QA)
- Key statistics (9 phases, {{COMPONENT_COUNT}}+ interaction contracts, {{SECTION_COUNT}} sections, {{PAGE_COUNT}} pages, {{TIMELINE_WEEKS}} weeks, {{QA_ITEM_COUNT}}+ QA items)
- Getting started (5-minute workflow)
- Design OS philosophy (no ambiguity, no reinvention, production-ready)

**Length:** ~180-220 lines

**Tone:** Professional, organized, reference-style

---

## 10.3 — DESIGN-OS-COMPLETE.md

**Purpose:** Master index and summary. Single source of truth for what exists.

**Content:**

- Executive summary (what you have)
- Complete list of all deliverables with descriptions:
    - Phases 1-9 (brief 1-2 sentence description of each)
    - Ancillary documents (6 files)
- Deliverable statistics
- How to use this document (as an index)
- Cross-references between phases
- What's included vs. not included
- Version/date information

**Length:** ~250-300 lines

**Tone:** Authoritative, index-style

---

## 10.4 — ARTIFACT_INDEX.md

**Purpose:** Detailed index with deep descriptions. Maps each phase to its use case.

**Content:**

- Full listing of all 9 phases with:
    - Long description (3-4 sentences)
    - Who needs it (role/persona)
    - When to reference it (use cases)
    - What it contains (key sections)
    - How it flows to other phases (dependencies)
- Implementation files (Phases 7-9) detailed breakdown
- Reading order recommendations (different paths for different roles)
- Search keywords for each phase
- Build status roll-up drawn from Phase 8 — a view over the phases, never a substitute for them (see Critical Rules › Scope Preservation)

**Length:** ~300-350 lines

**Tone:** Reference, detailed

---

## 10.5 — SETUP-CHECKLIST.md

**Purpose:** Implementation setup walkthrough. Step-by-step guide to begin building.

**Content:**

- Pre-implementation prerequisites
    - Read these phases first (1, 3, 7)
    - Understand these concepts (personas, navigation, interaction contracts)
- Environment setup (Node, pnpm, editor setup)
- Project initialization
    - Next.js setup commands
    - TypeScript configuration
    - Folder structure creation (matching Phase 7)
- Dependencies
    - Install the agreed dependencies (per the Library Selection Policy — confirm before installing)
- Testing setup (unit / component + end-to-end, per the Library Selection Policy)
- Developer workflow setup (git hooks, linting, formatting)
- Verification checklist (everything installed and ready)

**Length:** ~250-300 lines

**Tone:** Instructional, numbered steps, practical

---

## 10.6 — IMPLEMENTATION_PROMPT.md

**Purpose:** Complete implementation guide. Self-contained prompt for code building. All 9 phases synthesized into engineering action items.

**Content:**

- Overview (what this prompt does, how to use it)
- References to Phases 1-6 (required reading before coding)
- **Visual Design Hand-off** (REQUIRED SECTION, include verbatim)
    - "This design OS defines what each page must do, not how it looks. The look of each page is decided when it is built: before coding a page, run a visual concept for it with the repo's UI skills, present it to the owner, and build only after approval. Review the rendered page before marking it Built."
- Phase 7 Implementation (Architecture setup)
    - Folder structure (exact paths)
    - Route structure (exact routes)
    - Providers and contexts
    - Hooks organization
    - Component organization
- Phase 8 Implementation (Sprint breakdown)
    - Sprint 1-8 breakdown ({{TIMELINE_WEEKS}} weeks total)
    - What to build each sprint
    - Which pages and flows per sprint
    - Dependencies and sequencing
    - Milestones and deliverables
- Phase 9 Implementation (QA checklist)
    - Pre-launch QA items ({{QA_ITEM_COUNT}}+ items organized by category)
    - Accessibility verification
    - Performance targets
    - Browser compatibility
    - Responsive behaviour verification
    - Interaction contract completeness
- Code patterns and standards
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
- Pre-merge checklist
- Deployment readiness
- References to all other phases for context lookups

**Length:** ~700-1000 lines

**Tone:** Technical, directive, reference

---

## 10.7 Output Requirements for Phase 10

Generate exactly 6 markdown files:

1. START_HERE.md
2. README.md
3. DESIGN-OS-COMPLETE.md
4. ARTIFACT_INDEX.md
5. SETUP-CHECKLIST.md
6. IMPLEMENTATION_PROMPT.md

All files must:

- Cross-reference each other appropriately
- Reference the 9 phases consistently
- Use identical formatting conventions
- Maintain consistent tone within each document type
- Include version/date information
- Include table of contents where applicable (files >250 lines)

---

# Complete Deliverables Summary

## Critical References

**No Visual Prescription** (see Critical Rules › No Visual Prescription) — this design OS defines what the product does. How anything looks is decided when each page is built. This applies throughout all 9 phases and the implementation prompt.

## Phase 1-9: Core Design OS (9 files)

- phase-1-product-vision.md
- phase-2-experience-maps.md
- phase-3-information-architecture.md
- phase-4-page-blueprints.md
- phase-5-section-blueprints.md
- phase-6-interaction-contracts.md
- phase-7-frontend-architecture.md
- phase-8-implementation-roadmap.md
- phase-9-qa-checklist.md

## Phase 10: Ancillary Documentation (6 files)

- START_HERE.md
- README.md
- DESIGN-OS-COMPLETE.md
- ARTIFACT_INDEX.md
- SETUP-CHECKLIST.md
- IMPLEMENTATION_PROMPT.md

**Total: 15 files, all generated in one complete system**

---

# Functional Standards

The resulting product must be:

- Highly usable
- Mobile-first
- Responsive
- Accessible
- Fast
- SEO-friendly
- Conversion-focused

Every page must support:

- Loading states
- Empty states
- Error states
- Offline behavior where appropriate
- Keyboard navigation
- Screen reader compatibility
- Progressive enhancement

---

# Cross-File Linking Requirements

All 15 files must be interconnected:

1. **Phase files** reference each other in logical progression (1→2→3...→9)
2. **Ancillary files** reference phases for context (e.g., SETUP-CHECKLIST references Phase 7)
3. **START_HERE.md** is the entry point, directing users to README and other files
4. **IMPLEMENTATION_PROMPT.md** synthesizes all 9 phases into actionable engineering steps
5. Consistent file naming, formatting, and structure across all 15 files

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

All 15 files must be generated together as a cohesive system.

When the design operating system is complete, the entire 15-file design operating system must be suitable for immediate handoff to frontend engineering teams.

## No Visual Prescription

Never prescribe visual design. No colours, fonts, sizes, spacing, layouts, placement ("banner here", "hero with image"), imagery, animation, visual references or wireframes, in any phase or in the implementation prompt.

Describe what users need, what information and actions each page must offer and in what priority, and how it behaves. Never how it looks or where things sit.

The look of each page is decided when it is built, with the owner.

## Scope Preservation

A specified feature is never removed because it has not been built.

"Not built", "not started", "deferred" and "out of scope for this sprint" are **statuses**, recorded in Phase 8's Build Status Vocabulary. They are never resolved by deletion. Implementation state never edits Phases 1–7 — the blueprints record intent, the roadmap records progress, and the two are not the same document.

Absence from the codebase is evidence about the codebase, not about the spec.

Removal requires an explicit instruction from the maintainer naming the feature. A feature may be renamed, resharded, or moved between phases only with a note recording what it was and why it changed.

---

# Output Contract

Before formatting, obey these delivery rules — they determine _where_ the deliverable lands, not just what it looks like.

**Location.** Write all 15 files into `{{OUTPUT_DIR}}` as individual `.md` files. Never concatenate them into a single blob or a single chat response. Use these exact paths:

- `{{OUTPUT_DIR}}/phase-1-product-vision.md` through `{{OUTPUT_DIR}}/phase-9-qa-checklist.md`
- `{{OUTPUT_DIR}}/START_HERE.md`
- `{{OUTPUT_DIR}}/README.md`
- `{{OUTPUT_DIR}}/DESIGN-OS-COMPLETE.md`
- `{{OUTPUT_DIR}}/ARTIFACT_INDEX.md`
- `{{OUTPUT_DIR}}/SETUP-CHECKLIST.md`
- `{{OUTPUT_DIR}}/IMPLEMENTATION_PROMPT.md`

**Delivery mode.** One file per artifact, written to disk (via the environment's file-writing tool). Cross-links between files use relative paths within `{{OUTPUT_DIR}}`.

**Regeneration.** A run over a non-empty `{{OUTPUT_DIR}}` is a **merge, not an overwrite**. Before writing anything, read the existing artifact set and inventory every page, section, interaction contract, flow, persona, role and state it defines. Every entry in that inventory must survive into the new set, carrying its Phase 8 status. Visual prescriptions from an earlier run (tokens, palettes, layouts, wireframes) are not features: drop them and list them under **Changed**. See Critical Rules › Scope Preservation.

**Ordering.** Generate in dependency order: phases 1→9 first (each referencing prior phases), then the 6 ancillary documents (which reference the phases).

**Completion signal.** After all 15 files are written, emit a manifest in four sections — **Retained**, **Added**, **Changed**, **Removed** — listing every file path produced and confirming cross-links resolve. **Removed** must be empty unless the maintainer named those entries for removal; a feature that disappeared without instruction is a failed generation, not a completed one. Do not consider the task complete until the manifest is printed and **Removed** is accounted for.

---

# Output Format

Generate all 15 markdown files (.md) with:

- Consistent heading hierarchy (# = title, ## = major section, ### = subsection)
- Table of contents for files >250 lines
- Clear sections with consistent formatting
- Cross-links between files (markdown links)
- Version/date stamps
- Consistent tone within document types
- Examples where appropriate, in text and data only: no wireframes, mockups or ASCII layouts
- Implementation notes for engineers

Each file is self-contained but interconnected with the others.

The complete package (all 15 files) is the final deliverable, suitable for enterprise handoff.

---

**This updated prompt produces a complete, interconnected 15-file design operating system ready for production implementation.**
