# Antigravity Build Instructions — Learning Intelligence Platform

> Read this entire file before writing any code. Do not skip sections.
> This file is your only source of scope. If something is not written
> here or in `MASTER_SPEC.md`, do not build it — ask instead of guessing.

---

## 0. What you have access to

1. `MASTER_SPEC.md` — the product/architecture spec. This is the source
   of truth for **what** to build and **how it behaves**.
2. `/legacy/` — the old TestForge codebase. This is a **parts bin**,
   not a starting skeleton. Most of it is the wrong product (an exam
   proctoring/integrity tool) with the wrong structure (no shared
   services, logic duplicated per-app). Section 4 below tells you
   exactly what to take from it and what to ignore.
3. This file — **how** to sequence the work, what NOT to build, and
   the reuse map.

Do all new work in a fresh top-level structure, e.g. `/app` (frontend)
and `/server` (backend) at the repo root, separate from `/legacy`.
Never edit files inside `/legacy` — only read them for reference or
copy specific named files out of them.

---

## 1. Absolute constraints — do not deviate from these

These are locked decisions. Do not "improve" on them, do not introduce
alternatives, do not ask whether a different tool would be better.

- Backend: **Express** (Node), single process. No FastAPI, no Python
  backend, no microservices.
- Database: **self-hosted PostgreSQL**. No Supabase. No managed
  DB-as-a-service.
- Auth: **roll your own** (JWT + bcrypt or equivalent). No Supabase
  Auth, no third-party auth provider.
- Semantic search: **pgvector** extension inside the same Postgres
  instance. Used only for: similar-question retrieval, duplicate
  detection, resource matching. Not used for anything else.
- Realtime/streaming: **WebSocket**, delivering events only. The
  WebSocket connection never performs generation — it only reports
  job/progress state that already lives in Postgres.
- AI generation concurrency: **in-process bounded async queue** +
  worker(s) inside the same Express process. No Redis, no external
  queue/broker, no distributed workers.
- AI model: local model via a **model adapter** interface
  (`generate_question()`, `generate_diagnostic()`, `generate_plan()`,
  `generate_explanation()`). The backend must not call the model
  directly anywhere outside this adapter.
- Never build: Kubernetes, Kafka, microservices, a Redis cluster, a
  distributed job system, a multi-instance WebSocket architecture, a
  generic API gateway, an observability platform, a six-level Bloom
  analytics engine, a general-purpose chatbot, an opaque numeric
  "risk score" of any kind.

If you think one of these constraints is blocking a feature, stop and
flag it instead of silently working around it.

---

## 2. Core data flow — memorize this, everything hangs off it

```
QUESTION → ATTEMPT → EVALUATION → LEARNING EVIDENCE → CONCEPT-LEVEL SIGNAL
  → LEARNING GAP → (DIAGNOSTIC | INTERVENTION) → PRACTICE → REASSESSMENT
  → NEW EVIDENCE (loops back into LEARNING EVIDENCE)
```

Two layers, kept separate everywhere in the codebase:

- **Deterministic core** (never touched by AI, always trustworthy):
  attempts, evaluation/scoring, evidence aggregation, gap detection,
  progress comparison, code test-case results.
- **AI layer** (bounded, replaceable, always validated before it's
  trusted): question generation, diagnostic generation, learning
  plans, hints/explanations, semantic retrieval.

A "Learning Gap" is always rendered as evidence (a list of concrete
observations with timestamps/counts), never as a single score. If you
catch yourself building a field like `risk_score: number` or
`confidence: 0.87` with nothing backing it, stop — that is the exact
pattern this project explicitly rejects.

---

## 3. Golden path — build this end-to-end before anything else

This is the only thing that must work perfectly. Everything else is
secondary.

```
Teacher seeds MCQs
  → AI generates related questions (streamed via WebSocket, teacher picks count)
  → Teacher reviews & publishes
  → Student attempts questions (Practice Lab)
  → Attempt → Evaluation → Evidence created
  → Evidence aggregates into a Learning Gap
  → Teacher opens Diagnostic Lab → runs a targeted diagnostic on the gap
  → Diagnostic reveals a specific misconception
  → Teacher creates an Intervention (targeted practice / plan) from Intervention Center
  → Student completes the intervention practice
  → Reassessment attempt → new Evidence
  → Progress Lab shows before/after comparison
```

Do not start building secondary apps (Class Insights, Code Lab,
Settings) until this full loop runs, in order, without manual DB
edits, from a clean database.

### Build-depth priority (in order)

🔥 Full, must be excellent: Student Intelligence, Diagnostic Lab,
Intervention Center, Practice Lab, My Learning, Progress Lab,
Question Generation, Streaming, Evidence pipeline.

🟡 Functional, don't over-invest: Class Insights, Code Lab.

🟢 Minimal: Settings (account, light/dark, global font size — nothing
more).

---

## 4. Reuse map for `/legacy`

For every file below, do exactly what its action says. Do not deviate.

### PORT — copy the file, adapt imports/DB calls, keep the logic

| Legacy path | What it is | Adaptation needed |
|---|---|---|
| `server/lib/evaluator.js` | MCQ + debugging evaluation logic | None to the logic itself — this is the deterministic-core evaluation step. Just wire it to the new schema/tables. |
| `server/routes/execute.js` | Multi-tier code execution fallback (Judge0 → local runner → Piston) | Keep the fallback-chain *pattern* exactly — this is the template for the AI model adapter's fallback too. Adapt DB calls off Supabase onto Postgres. |
| `server/lib/localRunner.js` | Local code execution via `spawn` | Keep, but note it has **no sandboxing** (runs directly on host). Acceptable for hackathon demo scope, but do not silently expand its use beyond Code Lab's defined coding challenges. Flag if asked to run arbitrary/untrusted code elsewhere. |
| Root-level `extractJSON()` function inside `server/routes/ai.js` | Robust JSON extraction from messy LLM text output | Copy this function as a shared utility (e.g. `server/lib/aiOutput.js`). It's a solid building block for the AI Output Trust Model (schema validation step). |
| `client/src/os/Desktop.tsx`, `Dock.tsx`, `WindowManager.tsx`, `MenuBar.tsx`, `LockScreen.tsx`, `AppWindow.tsx` | The OS-style shell (window management via react-rnd, dock, menu bar) | Port directly. This already matches the spec's "OS-style React shell." Only change: the app registry it points to (Section 5 below), not the shell mechanics. |
| `client/src/os/store/useOSStore.ts`, `useOSSettings.ts` | Window state + settings state (zustand) | Port directly, extend with new app IDs as needed. |
| `client/src/os/components/*` (DockIcon, TrafficLights, WindowTitleBar, WindowSwitcher, VSCodeLayout, Terminal, CodingEditorOverlay) | Shared shell UI components | Port directly. |
| Monaco editor integration (`@monaco-editor/react` usage in `CodeEditorApp.tsx`) | Code editor UX | Port the editor setup/config (autocomplete, syntax highlighting, indentation). Rebuild the app logic around it fresh for Code Lab's new challenge model. |

### REFERENCE ONLY — look at it for UI/UX patterns, do not copy the code

- `client/src/os/apps/TestManagerApp.tsx`, `QuestionBankApp.tsx`,
  `ResultsApp.tsx`, `AnalyticsApp.tsx`, `AdminAnalyticsApp.tsx`,
  `StudentAnalyticsApp.tsx`, `TestSessionApp.tsx`, `TestSettingsApp.tsx`
  — these are the old product's apps (exam/proctoring tool). Their
  business logic does not map to the new 9-app learning-loop product.
  Look at them only for table/chart/form UI patterns if useful, then
  build the new apps' logic from scratch against the new schema.
- `server/routes/admin.js`, `analytics.js`, `attempts.js`,
  `questions.js`, `tests.js` — same as above: reference for query
  shapes/patterns only, not a source to copy route-for-route. The new
  backend is organized around shared domain services (evidence,
  gap-detection, generation-job-manager), not one file per old app.

### DO NOT USE — do not port, do not reference as a pattern to follow

- `server/lib/auditor.js` — this generates a numeric `suspicion_score`
  (an opaque risk score) via an LLM prompt. This is the exact
  anti-pattern the spec rejects for learning gaps. Do not use this
  file's approach anywhere in the evidence/gap system, even adapted.
- `server/supabase.js` and every `@supabase/supabase-js` call
  throughout the old routes — being replaced by direct Postgres
  access. Do not import the Supabase client into new code.
- `server/routes/ai.js`'s `generate-variants-stream` endpoint as a
  whole (SSE-based, no persisted job state, no retry budget, no
  cancellation) — the *idea* of incremental generation is right, but
  it must be rebuilt as a proper `GenerationJob` behind a WebSocket,
  per Section 24–29 of `MASTER_SPEC.md`. Don't reuse the SSE endpoint
  itself.
- Any file under `.kiro/`, `.agent/`, old `documentation/*.md` in
  `/legacy` — these describe the old product's architecture and will
  actively mislead you about what you're building now. Ignore them.

---

## 5. New application registry (what to actually build)

Teacher: `StudentIntelligenceApp`, `ClassInsightsApp`,
`DiagnosticLabApp`, `InterventionCenterApp`.

Student: `MyLearningApp`, `PracticeLabApp`, `CodeLabApp`,
`ProgressLabApp`.

Shared: `SettingsApp`.

These replace the old app registry entirely. Do not keep old app IDs
around "just in case."

---

## 6. Build order (do these phases strictly in sequence)

For each phase: implement it, then run/verify it before moving to the
next. Do not jump ahead because a later phase seems easier or more
interesting.

**Phase 1 — Schema.** Postgres tables for: users, assessments,
questions, attempts, learning_evidence, learning_gaps, diagnostics,
diagnostic_attempts, interventions, reassessments, progress,
generation_jobs, generated_questions. Add pgvector extension and an
`embedding` column only on `questions` (and later, resources) — not
elsewhere. No other tables unless the spec explicitly calls for them.

**Phase 2 — Auth + deterministic core.** Roll auth (register/login,
JWT). Port `evaluator.js`. Build attempt → evaluation → evidence
write path for MCQs only (no AI yet). Verify: a seeded MCQ, answered
wrong, produces a row in `learning_evidence`.

**Phase 3 — Evidence aggregation + gap detection.** Build the
recency-aware aggregation that turns multiple evidence rows into a
`learning_gaps` row. No AI involved — this is deterministic logic
over evidence rows. Verify: 3 wrong attempts on the same concept
produce one gap with visible evidence, not a score.

**Phase 4 — AI model adapter + generation job pipeline.** Build the
adapter interface, the bounded async queue, `GenerationJob` state
machine (requested/generated/status/cancelled/retry_count), WebSocket
event delivery (`generation.started`, `generation.progress`,
`question.generated`, `question.failed`, `generation.cancelled`,
`generation.completed`). Include the question blueprint step (concept,
subconcept, Bloom target, difficulty, constraints) before generation,
and schema/constraint validation with bounded retry before persistence.
Build the demo fallback (pre-generated validated pool, routed through
the same validate→persist→stream path) per the locked fallback design.
Verify: teacher requests 10 questions, sees them stream in one by one,
can cancel mid-generation, browser refresh doesn't lose progress.

**Phase 5 — Practice Lab + Student Intelligence (golden path core).**
Student can practice AI-generated + teacher questions. Teacher can see
a student's evidence-backed gaps. Verify against Section 3's golden
path up through gap detection.

**Phase 6 — Diagnostic Lab + Intervention Center.** Gap → diagnostic
blueprint → targeted questions → student attempt → refined evidence
identifying a specific misconception. Then gap/diagnostic → AI-
generated intervention plan → targeted practice. Verify: full golden
path runs teacher-seed to intervention-assigned without manual steps.

**Phase 7 — Reassessment + Progress Lab.** New attempt after
intervention produces new evidence; Progress Lab shows before/after.
This closes the golden path loop end-to-end.

**Phase 8 — My Learning (student home) + Class Insights (aggregate
view) + Code Lab (defined challenges, deterministic test-case
evaluation, AI explains but never grades) + Settings.** Build these at
🟡/🟢 depth per Section 3 — functional, not polished.

**Phase 9 — Semantic layer.** Only after everything above works: wire
pgvector for similar-question retrieval, duplicate detection, resource
matching, as three use cases over one retrieval capability, not three
services.

---

## 7. Rules to re-check before every phase

- Does this feature produce evidence, interpret evidence, create an
  action, execute an action, or measure an outcome? If not, question
  whether it belongs in this phase at all.
- Is AI output going straight into something a teacher/student trusts
  as fact? If yes, it must pass through validation and (where it's a
  graded/evidence-producing step) not silently replace deterministic
  evaluation.
- Did a generation request get an explicit count and a hard maximum?
- Does every AI generation attempt have a bounded retry count, not an
  open-ended retry loop?
- Is any new numeric field being added that isn't backed by visible,
  inspectable evidence? If yes, stop and reconsider it.

---

## 8. What "done" looks like for this build

You can explain the whole system in this paragraph and it's true of
what you built:

> "React frontend, single Express backend, PostgreSQL as the single
> source of truth. Student attempts produce traceable learning
> evidence, aggregated into concept-level learning gaps. Teachers
> diagnose gaps and create targeted interventions; students are
> reassessed and new evidence closes the loop. AI is used for bounded
> tasks — question and diagnostic generation, learning plans, hints —
> run asynchronously through an in-process queue and streamed over
> WebSocket. pgvector provides semantic retrieval where useful. AI
> assists the learning system; it doesn't own the truth."

If any part of that sentence isn't true of the actual codebase, the
build isn't done yet — go fix that part before adding anything new.
