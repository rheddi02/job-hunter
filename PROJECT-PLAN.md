# PROJECT-PLAN.md — JobPilot

Companion to `CLAUDE.md`. That file governs *how* to build; this one governs *what* to build and *in what order*. Check items off as you complete them — in the same commit as the feature, per `CLAUDE.md` §9.

## Vision

A personal job-hunt automation system: parse a CV once, surface matched roles from legitimate sources, draft tailored cover letters, and track every application with hard duplicate prevention — built to later flip into a multi-tenant product without a rewrite.

## Tech Stack Recap

Next.js + TypeScript + Tailwind · Prisma + PostgreSQL (Supabase) · Supabase Auth · BullMQ + Redis worker · Anthropic Claude API · Vercel + Fly.io/Railway. Full rules in `CLAUDE.md` §3–§7.

## Design System Recap

See `CLAUDE.md` §8 for the full token set. Every screen below must implement Loading / Empty / Error / Populated states — this is repeated per phase below so it can't be skipped.

---

## Phase 0 — Setup & Foundations

- [x] Initialize Turborepo monorepo: `apps/web`, `apps/worker`, `packages/db`, `packages/shared`, `packages/ui`
- [x] Supabase project: Postgres + Auth + a private Storage bucket for resumes
- [x] Prisma schema, first migration: `profiles`, `job_sources`, `jobs`, `matches`, `applications`, `cover_letters`, `status_events`
- [x] Tailwind theme configured from the tokens in `CLAUDE.md` §8 (colors, spacing, radius, fonts)
- [x] Redis (Upstash) + BullMQ skeleton in `apps/worker`
- [x] Shared Anthropic API client wrapper in `packages/shared` (not duplicated per call site)
- [x] `.env.example` scaffolded — no real secrets committed
- [x] CI: lint + typecheck on every PR

**Phase 0 done when:** a fresh clone + `pnpm install` + migration gets you an empty but running web app and worker, both connected to Supabase.

---

## Phase 1 — MVP

### 1.1 Profile / CV Ingestion
- [x] Resume upload (PDF) → Supabase Storage, signed URLs only, never public
- [x] CV parsing → structured skills/experience JSON via Claude API
- [x] Profile editor screen — review/correct parsed skills before matching runs against them
- [x] Loading / Empty / Error / Populated states on the profile screen

### 1.2 Job Ingestion
- [x] Greenhouse adapter (public Job Board API, GET only)
- [x] Lever adapter
- [x] Adzuna adapter
- [x] Arbeitnow or RemoteOK adapter (remote-specific coverage)
- [x] `job_sources` config table + a settings screen to add/disable a source
- [x] Scheduled polling job per source (BullMQ), respecting each source's documented rate limits
- [x] Dedup enforced via `content_hash` + the unique constraints from `CLAUDE.md` §7
- [x] Stale-job check: confirm a job still exists/is open before generating a cover letter for it

### 1.3 Matching Engine
- [x] Skill-overlap scoring against the parsed profile
- [x] Embedding similarity scoring, combined with skill overlap into one 0–100 score
- [x] `matched_skills` array populated per match — this powers "why this matched" in the UI
- [x] Score badge UI, banded (e.g. 80+ strong / 50–79 partial / <50 weak), using the fixed status colors from `CLAUDE.md` §8

### 1.4 Jobs List & Detail
- [x] `/jobs` — paginated, filterable by score / source / remote-type
- [x] `/jobs/[id]` — full description, match breakdown, "Generate cover letter" CTA
- [x] Loading / Empty / Error / Populated states on both screens

### 1.5 Cover Letter Generation
- [x] Single prompt template (`modules/coverletters/prompts.ts`) combining CV + job description + `matched_skills`
- [x] Editable draft UI
- [x] "Regenerate" creates a new version rather than overwriting the current one

### 1.6 Application Tracking (Kanban)
- [x] Status state machine: `Matched → Drafted → Applied → Interviewing → Rejected / Ghosted`, illegal transitions rejected at the function level
- [x] Kanban board UI with the fixed status colors from `CLAUDE.md` §8
- [x] `status_events` row inserted on every transition (one row per change — `from_status`, `to_status`, `changed_at`)
- [x] Duplicate prevention surfaced in the UI itself (e.g. an "Already tracked" badge when a job already has an application row for this user) — not just enforced silently at the DB layer

### Phase 1 — Definition of Done
- [ ] Every checkbox above is checked
- [ ] One full manual run completed end-to-end: upload CV → see ranked matches → generate a letter → mark Applied → re-run matching and confirm the same job is blocked from being added twice

---

## Phase 2 — Browser Extension (Autofill, Review-Gated)

Do not start until Phase 1 is fully checked off.

- [ ] Chrome MV3 extension scaffold (separate `apps/extension`, separate review cycle from web/worker)
- [ ] Content script detects supported application forms (LinkedIn Easy Apply, Indeed, generic ATS-hosted forms)
- [ ] Fetches autofill payload from `/extension/autofill-payload?jobId=`
- [ ] Fills form fields only — **never auto-clicks submit on LinkedIn or Indeed**, per `CLAUDE.md` §2
- [ ] Domain allowlist enforced in code, not just documented intent
- [ ] Manual QA pass against each supported domain before marking this phase done

---

## Phase 3 — ATS-Direct Auto-Submit (Opt-In, Sanctioned Channel Only)

Do not start until Phase 2 is stable in daily use.

- [ ] Greenhouse application-submission integration (Basic Auth, per their documented endpoint)
- [ ] Lever equivalent, if available for the boards in use
- [ ] Per-source "auto-submit enabled" toggle in settings, **default OFF**
- [ ] Audit log of every auto-submitted application — what was sent, to which job, when

---

## Phase 4 — SaaS Pivot (Deferred Indefinitely Until Personal Use Is Stable)

- [ ] Flip `organization_id` live; add org-scoped Row-Level Security policies in Supabase
- [ ] Stripe billing integration
- [ ] Per-tenant source-quota management
- [ ] Multi-user admin/settings separation

---

## Backlog / Explicitly Not Building Yet

- **Upwork:** read-only job feed + AI-drafted proposal text the user pastes manually. No auto-submit — ever. See `CLAUDE.md` §2 for why.
- Additional sources: Workable, Ashby, alternate remote-job feeds
- Analytics: average days per status, win-rate by source — post-MVP, only once there's enough data to make it meaningful
