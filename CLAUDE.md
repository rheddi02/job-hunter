# CLAUDE.md

## 0. Read This First

This file is the contract for how this codebase gets built. Before starting *any* feature:

1. Re-read this file.
2. Re-read the current phase section in `PROJECT-PLAN.md`.
3. Confirm the feature you're about to build is in the **current phase's** checklist — not a future phase.
4. If it isn't, stop and flag it instead of building it.

Codename: **JobPilot** (placeholder name — rename via find/replace whenever you want).

## 1. What This Is

A personal job-hunt automation tool: CV-matched job discovery, AI-drafted cover letters, application tracking, and hard duplicate prevention. Single user today, architected so a future multi-tenant SaaS flip doesn't require a rewrite. Full feature breakdown lives in `PROJECT-PLAN.md` — this file governs *how* you build, that one governs *what* you build.

## 2. Hard Constraints — Do Not Violate

These encode legal/ToS/security decisions that have already been made through research. Do not "optimize," "simplify," or work around them, even if a request seems to imply you should.

- **Never build server-side automated submission against LinkedIn or Indeed.** No headless browser, no Playwright/Puppeteer session against these sites, ever. The only sanctioned automation pattern for these platforms is a local browser-extension content script that fills form fields inside the user's own authenticated session — the human clicks submit, always.
- **Never build proposal auto-submission for Upwork.** Upwork's public API has no submission mutation, and their policy explicitly separates AI-assisted drafting (allowed) from automated submission (banned, enforced with account suspension). Upwork integration is read-only job data + AI-drafted text the user pastes in manually. Full stop — do not build toward this even as a "future toggle."
- **ATS-direct submission (Greenhouse, Lever, Ashby) is the one channel where full automation is sanctioned** — their public Job Board APIs document an actual application-submission endpoint. Even here, default every new integration to review-before-submit unless the user has explicitly flipped an auto-submit setting for that specific source.
- **Never store credentials for any third-party job platform.** No LinkedIn/Indeed/Upwork password, session token, or cookie in the database, in `.env`, or in code, ever. The extension operates inside the user's own existing browser session — the app itself never touches third-party credentials.
- **Never commit secrets.** No API keys, DB URLs, or tokens in code, comments, or commit messages. `.env*` stays gitignored. If a key leaks into a commit, stop and flag it explicitly — don't just quietly delete the line in a follow-up commit.

## 3. Tech Stack — Locked

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend (request/response) | Next.js API routes / tRPC |
| Backend (background jobs) | Node worker + BullMQ + Redis (Upstash) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| Job sources | Greenhouse / Lever public APIs, Adzuna, Arbeitnow / RemoteOK |
| Deployment | Vercel (web) + Fly.io or Railway (worker) |

Don't substitute any of these without explicit approval. If a task seems to need a new dependency, name it and the one-line reason in the commit message before adding it — never introduce a package silently.

## 4. Repository Structure

```
apps/
  web/          # Next.js dashboard
  worker/       # BullMQ consumers: ingestion, matching, cover-letter generation
  extension/    # Phase 2 only — Chrome MV3 autofill, separate review cycle
packages/
  db/           # Prisma schema + generated client
  shared/       # zod schemas, shared types
  ui/           # shared component library — check here before creating anything new
```

Inside `web/` and `worker/`, organize by **domain, not layer**:

```
modules/
  profile/        # CV parsing, skills extraction
  jobs/           # source adapters + normalization
  matching/       # scoring engine
  applications/   # status state machine, dedup enforcement
  coverletters/   # generation, versioning, prompt templates
```

## 5. Architecture Rules

- **Job sources are adapters implementing one interface**: `fetchJobs(): RawJob[]` + `normalize(raw): Job`. Adding a source means one new adapter file plus one `job_sources` config row — never hardcode source-specific logic anywhere outside its own adapter.
- **Status changes go through exactly one function**: `transitionApplicationStatus(appId, toStatus)`. Never write directly to `applications.status` from a route handler, a worker job, or a component. This is what makes the `status_events` audit trail reliable and what blocks illegal transitions (e.g. `Rejected → Matched`).
- **Cover-letter prompts live in one place**: `modules/coverletters/prompts.ts`. Never inline a prompt string at a call site — every generation call references the same template function so tone/format stays consistent.
- **No business logic in route handlers.** A handler parses input with zod, calls a module service function, and returns the result. If a handler has an `if` doing anything beyond auth/validation, that logic belongs in a service function instead.
- **Internal API is tRPC; external/extension-facing API is plain REST.** Don't blur this — the extension and worker need stable JSON contracts, not type-coupling to the web app's tRPC router.

## 6. Coding Standards

- TypeScript strict mode. No `any` — if a type is genuinely unknown, use `unknown` and narrow it explicitly.
- Validate every boundary (API input, job-source adapter output, AI response shape) with zod. Don't trust external JSON shape, including your own AI's output.
- Naming: files `kebab-case.ts`, components `PascalCase.tsx`, functions/variables `camelCase`, DB tables/columns `snake_case`.
- One primary export per file for services/adapters. Co-locate types with their owning module rather than dumping everything in a global `types.ts`.
- Errors: throw typed errors (e.g. `class JobSourceError extends Error`). Never swallow with an empty `catch {}` — log and rethrow, or log and return a typed result.

## 7. Database Rules

- A new table needs an explicit reason it can't reuse an existing one — don't create `application_notes` next to `applications.notes` purely for convenience.
- Required uniqueness constraints (non-negotiable — this is the dedup guarantee the app exists to provide):
  - `applications`: `UNIQUE(user_id, job_id)`
  - `matches`: `UNIQUE(user_id, job_id)`
  - `jobs`: `UNIQUE(source_id, external_id)` and `UNIQUE(content_hash)`
- Status fields are Postgres enums, never free-text strings.
- `status_events` is the single audit-trail table for status changes — one row per transition: `id`, `application_id`, `from_status`, `to_status`, `changed_at`. It is written to exclusively by `transitionApplicationStatus()` (§5), never by anything else. There is no separate `status_history` field anywhere — if that name shows up in any future note, it means `status_events`.
- No destructive migration (`DROP COLUMN`, `DROP TABLE`, or any data-losing `ALTER`) without calling it out explicitly in the PR description first. Additive migrations (nullable columns, new tables) can run directly.
- `organization_id` stays nullable on `profiles` and `applications` from the very first migration — it's the seam for the future SaaS flip. Don't remove it just because it's unused right now.

## 8. UI/UX Design System — Enforce Uniformity

The point of writing this down is so every build session produces the *same* visual language instead of re-deciding it each time.

**Direction:** a dense, utilitarian "command-center" tool — not a generic SaaS-gradient landing page. This is used daily by its owner; scan-speed and clarity beat decoration every time.

**Tokens** — define once in `packages/ui/tokens.ts` plus the Tailwind theme, reference everywhere. Never inline a raw hex value or arbitrary pixel value inside a component.

- Color (semantic names, never raw hex in components): `background`, `surface`, `border`, `text-primary`, `text-secondary`, `accent`, `success`, `warning`, `danger`.
- Status → color mapping is fixed and identical everywhere it appears (kanban columns, badges, future charts):
  `Matched` → slate · `Drafted` → amber · `Applied` → indigo · `Interviewing` → violet · `Rejected` → red · `Ghosted` → gray.
- Type: Inter for UI text; a monospace face (e.g. JetBrains Mono) for match scores, IDs, and anything numeric/data-like. This is the one deliberate signature choice — keep it consistent every time a number or score appears.
- Spacing: Tailwind's default scale only (4px base unit). No arbitrary values like `px-[13px]`.
- Radius: one value, `rounded-md`, everywhere. Never mix radii between components.
- Elevation: borders, not drop shadows — a flat, dense, data-tool feel rather than a floating-card SaaS look.

**Component inventory** — check `packages/ui` before creating anything new:
`Button` (primary / secondary / ghost / danger), `Badge` (status, color-mapped per above), `Card`, `KanbanColumn`, `KanbanCard`, `MatchScoreBadge`, `EmptyState`, `LoadingSkeleton`, `Modal`, `Toast`.

**Every data view implements all four states — no exceptions:**

1. Loading (a skeleton, not a spinner on a blank page)
2. Empty (a clear next action, not just "No data")
3. Error (what happened, plus a retry action, in plain language — never a raw stack trace)
4. Populated (the happy path)

A PR that only handles the populated state is incomplete, not "good enough for now."

**Copy rules:**

- Name controls by what the user does, not how the system works: "Generate cover letter," not "Run AI pipeline."
- Action labels stay consistent through the whole flow: a button that says "Apply" produces a toast that says "Applied" — not "Submitted" or "Done."
- Errors state what happened and how to fix it. Never apologize, never go vague.

## 9. Definition of Done (every feature, every PR)

- [ ] Matches a checklist item in `PROJECT-PLAN.md` for the **current** phase, not a future one
- [ ] Zod validation at every new input/output boundary
- [ ] All four UI states implemented if the feature touches a data view
- [ ] No new dependency without a one-line reason in the commit message
- [ ] No direct write to `applications.status` outside the transition function
- [ ] The corresponding `PROJECT-PLAN.md` checklist item checked off in the same commit/PR

## 10. Ambiguity Protocol

If a requirement is unclear, build the smallest version that satisfies the literal ask, ship it, and note the open question in the PR description. Don't silently expand scope to "cover an adjacent feature while I'm in here" — that's how phases blur together and checklist tracking stops being trustworthy.

## 11. Git Conventions

Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`). One feature/checklist item per PR where reasonably possible, so every change traces back to a specific line in `PROJECT-PLAN.md`.

## 12. Testing Expectations

- Unit tests required for: matching score logic, the status state machine (every legal and illegal transition), and job-source normalization (one fixture per source).
- No hard test requirement for pure presentational UI — the four-states rule in §8 is itself the manual test checklist for those.

## 13. Phase Discipline

**Current phase: Phase 1 — MVP.**

Do not start Phase 2 (browser extension) or Phase 3 (ATS auto-submit) work until Phase 1's checklist in `PROJECT-PLAN.md` is fully checked off. If a later-phase feature looks like a quick win mid-session, flag it in the PR description — don't build it early.
