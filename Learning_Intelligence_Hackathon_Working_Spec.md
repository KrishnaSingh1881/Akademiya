# Learning Intelligence Platform — Working Specification

> **WIP — Nothing here is final.**
>
> This is one hackathon build, not a V2/V3 roadmap. All capabilities described here belong to the same product. The implementation order may change, but the intended product scope is defined together.

---

## 1. Product Direction

The product is an AI-assisted learning and assessment platform built around one continuous loop:

**Assess → Observe → Diagnose → Act → Reassess → Improve**

The system should help teachers understand **what students are struggling with and why**, then turn that evidence into targeted learning actions.

AI is used for bounded, useful jobs:

- Question generation
- Question variation
- Learning-plan generation
- Diagnostic generation
- Hints/explanations
- Semantic retrieval where useful

The product is **not** a generic chatbot.

---

# 2. Core Product Structure

The OS-style UI is the interaction shell.

The applications are different views and actions over the **same learning data and learning loop**.

```text
                         UI / OS SHELL
                              │
             ┌────────────────┼────────────────┐
             │                │                │
          Teacher           Student         Settings
             │                │
             └────────────────┼────────────────┘
                              ↓
                     CORE LEARNING LOOP
                              │
              ┌───────────────┼───────────────┐
              ↓               ↓               ↓
         Assessment        Evidence         Actions
              │               │               │
              └───────────────┼───────────────┘
                              ↓
                         PostgreSQL
                              │
                  ┌───────────┼───────────┐
                  ↓           ↓           ↓
                 AI        Code Lab   Semantic Layer
                  │
             ┌────┼────┐
             ↓    ↓    ↓
          Generate Plan Diagnose
```

The important engineering principle is:

> **Do not build eight disconnected systems. Build one learning pipeline and expose it through multiple apps.**

---

# 3. Application Map

## Teacher

1. Student Intelligence
2. Class Insights
3. Diagnostic Lab
4. Intervention Center

## Student

5. My Learning
6. Practice Lab
7. Code Lab
8. Progress Lab

## Shared

9. Settings

These are OS-style applications/views. Their business logic should remain shared.

---

# 4. Shared Learning Pipeline

The central pipeline is:

```text
Question / Activity
       ↓
Student Attempt
       ↓
Evaluation
       ↓
Learning Evidence
       ↓
Concept-level signals
       ↓
Emerging Learning Gap
       ↓
Teacher / Student Action
       ↓
Targeted Practice / Diagnostic
       ↓
Reassessment
       ↓
New Evidence
```

Every application should consume or produce something in this pipeline.

---

# 5. Evidence Model

The system should prefer **evidence over opaque risk scores**.

Instead of:

```text
Risk Score: 87
```

show:

```text
Emerging difficulty: Recursion termination

Evidence:
• 3 recent weak attempts
• repeated base-case errors
• weak performance on application questions
```

## Evidence should contain enough context to remain traceable

Conceptually:

```text
LearningEvidence
├── student
├── concept
├── source
├── result
├── timestamp
├── relevant metadata
└── confidence / signal strength
```

### Recency

Evidence should not remain equally influential forever.

A recent repeated weakness should matter more than an isolated old mistake.

The first implementation can use a simple recency-aware aggregation rather than a complicated predictive model.

Conceptually:

```text
Recent evidence
      ↓
Recency weighting
      ↓
Repeated pattern detection
      ↓
Candidate learning gap
```

A gap is therefore an **evidence-backed candidate for attention**, not an unquestionable diagnosis.

Teachers remain able to inspect the underlying evidence before taking action.

---

# 6. Teacher App — Student Intelligence

## Purpose

Answer:

> **Who needs attention, what are they struggling with, and why?**

## Features

- Student search/filter
- Recent activity
- Assessment history
- Practice history
- Topic/concept performance
- Learning gaps
- Evidence trail
- Diagnostic history
- Intervention history
- Reassessment history
- Actions to diagnose/intervene

## Data flow

```text
Student Attempts
      ↓
Learning Evidence
      ↓
Concept Aggregation
      ↓
Recency + Repeated Pattern
      ↓
Candidate Learning Gap
      ↓
Student Intelligence
```

## UI

Use:

- Student cards
- Evidence panels
- Concept status
- Trend indicators
- Learning-gap cards
- Direct action buttons

Avoid turning this into a giant analytics dashboard.

---

# 7. Teacher App — Class Insights

## Purpose

Answer:

> **What is happening across the class?**

## Features

- Class topic health
- Concept-level patterns
- Common learning gaps
- Affected students
- Trends
- Basic Bloom distribution where useful
- Launch diagnostic
- Create targeted class practice

## Data flow

```text
Student Evidence
      ↓
Class Aggregation
      ↓
Concept / Topic Patterns
      ↓
Common Gaps
      ↓
Teacher Action
```

The class view is an aggregation of the same evidence used by Student Intelligence.

It should not introduce a second intelligence pipeline.

---

# 8. Teacher App — Diagnostic Lab

## Purpose

Answer:

> **What specific misconception or weak concept is behind this learning gap?**

The diagnostic workflow should operate directly on a detected gap.

## Features

- Select student/class
- Select target concept
- Select diagnostic type
- Generate bounded diagnostic questions
- Stream generated questions
- Teacher review
- Assign diagnostic
- View diagnostic evidence

## Diagnostic types

Potentially:

- Conceptual MCQ
- Trace/predict
- Debugging
- Coding
- Mixed

The exact diagnostic set can remain flexible.

## Data flow

```text
Learning Gap
      ↓
Diagnostic Configuration
      ↓
AI / Rule-based Generation
      ↓
Validation
      ↓
Streaming
      ↓
Teacher Review
      ↓
Assignment
      ↓
Student Attempts
      ↓
Evidence
```

---

# 9. Teacher App — Intervention Center

## Purpose

Turn a learning gap into an actionable learning activity.

This is not a separate intelligence engine from Diagnostic Lab.

Both operate on the same gap/evidence pipeline.

## Features

- Active interventions
- Student
- Learning gap
- Supporting evidence
- AI-generated learning plan
- Targeted MCQs
- Coding activity where relevant
- Learning resources
- Reassessment
- Intervention status

## AI learning plan

Example:

```text
Goal: Understand recursion termination

1. Concept explanation
2. Basic practice
3. Apply-level MCQs
4. Targeted coding task
5. Reassessment
```

Teacher can review/edit before assigning.

## Data flow

```text
Learning Gap
      ↓
Evidence
      ↓
Learning Action
      ↓
AI Learning Plan
      ↓
Teacher Review
      ↓
Targeted Practice
      ↓
Reassessment
```

---

# 10. Student App — My Learning

## Purpose

Answer:

> **Where am I, what needs work, and what should I do next?**

## Features

- Current learning plan
- Strong areas
- Focus areas
- Assigned assessments
- Assigned practice
- Active interventions
- Recent activity
- Next action

## Data flow

```text
Student Profile
+
Active Plans
+
Assignments
+
Recent Evidence
      ↓
My Learning
```

Keep the student-facing view actionable rather than analytics-heavy.

---

# 11. Student App — Practice Lab

## Purpose

Provide targeted MCQ practice.

## Features

- Teacher-published questions
- Teacher-approved generated variants
- AI-generated additional practice
- Question count control
- Topic/concept targeting where allowed
- Bloom targeting where useful
- Difficulty
- Progress
- Explanations/hints

## Question pool flow

```text
Available Questions
        ↓
Enough?
   ┌────┴────┐
   │         │
  YES        NO
   ↓         ↓
Practice   Generate N
             ↓
          Validate
             ↓
           Stream
             ↓
          Practice
```

The system should reuse teacher-approved generated questions instead of repeatedly regenerating the same material.

---

# 12. Student App — Code Lab

## Purpose

Retain the strong browser-based programming environment from the existing system.

The editor experience is a major quality-of-life feature for programming practice and diagnostics.

## Features

- Syntax highlighting
- Autocomplete
- Auto-indentation
- Bracket matching
- Error highlighting
- Line numbers
- Tabs
- Multiple files where required
- Run code
- Compile/output
- Terminal/output panel
- Language selection
- Resizable editor/output
- Keyboard shortcuts

## Data flow

```text
Coding Challenge
      ↓
Student Code
      ↓
Run / Compile
      ↓
Test Cases / Result
      ↓
Attempt Record
      ↓
Diagnostic Signals
      ↓
Learning Evidence
```

### Important constraint

Code should not be treated as magically explainable by an LLM.

A coding challenge should have defined metadata:

```text
Challenge
├── Concept
├── Sub-concept
├── Expected behaviour
├── Test cases
└── Diagnostic tags
```

Evidence can therefore come from concrete signals such as:

- Compilation failure
- Test-case failure
- Output mismatch
- Defined diagnostic condition
- Known error pattern

LLM analysis can assist with explanation/classification, but the evidence pipeline should not depend entirely on unrestricted code interpretation.

---

# 13. Student App — Progress Lab

## Purpose

Show whether learning actions actually improved performance.

## Features

- Before/after concept performance
- Reassessment result
- Concept progress
- Completed interventions
- Remaining focus areas
- Learning history
- Limited Bloom information where useful

## Data flow

```text
Baseline Evidence
      ↓
Intervention
      ↓
Practice
      ↓
Reassessment
      ↓
New Evidence
      ↓
Comparison
      ↓
Progress
```

---

# 14. Settings App

Keep this deliberately small.

## Account

- Name
- Login/account information
- Change password
- Logout

## Appearance

- Light theme
- Dark theme

## Global UI

- Font-size selection

Font size applies to the entire OS-style application.

No oversized preference system.

---

# 15. AI Question Generation

This is a core workflow.

## Teacher flow

```text
Create Learning Session
        ↓
Add Topic
        ↓
Add Seed MCQs
        ↓
Analyze Seeds
        ↓
Create Question Blueprint
        ↓
Choose Count
        ↓
Optionally Choose Bloom Distribution
        ↓
Generate
        ↓
Validate
        ↓
Stream
        ↓
Teacher Review
        ↓
Publish
```

## Question blueprint

```text
Concept
Sub-concept
Question type
Bloom level
Difficulty
Constraints
Expected knowledge
Correct answer
```

The blueprint prevents uncontrolled topic drift.

---

# 16. Bloom Taxonomy — Use It, Don't Worship It

Bloom remains useful, particularly for **question generation**.

Potential levels:

- Remember
- Understand
- Apply
- Analyze
- Evaluate
- Create

But Bloom should **not** become the backbone of every analytics screen.

### Primary use

Teacher says:

```text
Generate:
4 Remember
4 Understand
6 Apply
4 Analyze
2 Evaluate
```

The generation system uses those as targets.

### Secondary use

The system can display Bloom metadata in:

- Question review
- Student performance views
- Diagnostics
- Progress

But a student's entire intelligence profile should **not depend on perfect six-level Bloom classification**.

Bloom classification is inherently interpretive, so it should be treated as useful metadata/signals rather than absolute truth.

---

# 17. Streaming Generation

Streaming is a core UX requirement.

Never:

```text
Generate 20
      ↓
Wait 10 minutes
      ↓
Show 20
```

Instead:

```text
Generate 20

Q1 ✓ → UI
Q2 ✓ → UI
Q3 ✓ → UI
Q4 ✓ → UI
...
```

## Generation controls

Every generation operation must be bounded.

```text
Questions to generate
[-] 20 [+]

[ Generate ]
```

While running:

```text
✓ Q01
✓ Q02
✓ Q03
⟳ Q04
○ Q05
○ Q06

3 / 20 generated

[ Stop Generation ]
```

## Required behaviour

- Explicit count
- Hard maximum
- WebSocket-based real-time updates
- Queue-backed generation
- Incremental persistence
- Cancellation
- Retry individual failed items
- Retry cap
- Generate more after completion
- Never unbounded generation

---

# 18. Streaming Architecture

The streaming path should not be confused with a generic API gateway.

For AI generation:

```text
Frontend
   │
   │ generation request
   ▼
WebSocket Server
   │
   ▼
Generation Queue
   │
   ├── Job 1
   ├── Job 2
   ├── Job 3
   └── ...
   │
   ▼
AI Worker
   │
   ▼
Validation
   │
   ├── PASS → persist + stream
   │
   └── FAIL → bounded retry
   │
   ▼
WebSocket
   │
   ▼
Frontend
```

A small state store can track:

```text
GenerationJob
├── job_id
├── requested_count
├── generated_count
├── status
├── current item
├── cancellation state
├── retry information
└── timestamps
```

The exact queue/state technology remains an implementation decision, but the behavioural contract is fixed: **bounded, cancellable, incremental, real-time generation.**

---

# 19. Generation Validation

Generated questions should not be trusted blindly.

```text
Generate
   ↓
Validate
 ┌─┴───────────┐
PASS          FAIL
 ↓              ↓
Persist       Retry
Stream          ↓
              Retry limit
                ↓
              Flag/skip
```

Validation can check:

- Schema
- Correct option
- Option validity
- Duplicate options
- Concept alignment
- Requested Bloom target
- Difficulty target
- Obvious ambiguity
- Explanation where required

### Retry cap

Every generated item has a bounded retry budget.

No infinite regeneration loops.

---

# 20. Semantic Layer — PostgreSQL + pgvector

PostgreSQL is the primary source of truth.

pgvector is available and can be used where it provides a concrete benefit.

It should **not** be forced into every feature.

## One semantic capability, multiple uses

```text
                 Embedding Model
                       ↓
                 Semantic Index
                       ↓
              pgvector similarity
                 /      |       \
                /       |        \
      Similar Questions  Duplicate  Resources
                         Detection  Retrieval
```

### Use case 1 — Similar-question retrieval

```text
Seed Question
      ↓
Embedding
      ↓
pgvector search
      ↓
Relevant approved questions
      ↓
Generation context
```

This helps the generator remain close to the intended concept.

### Use case 2 — Duplicate detection

Compare a newly generated question with existing approved questions.

If semantic similarity is high:

```text
Possible duplicate
```

Flag it for review rather than silently discarding it.

### Use case 3 — Resource matching

```text
Learning Gap
     ↓
Embedding
     ↓
pgvector
     ↓
Relevant resources
```

This can help connect a diagnosed gap to available learning material.

All three are patterns over the same semantic retrieval capability, not three separate AI services.

---

# 21. AI Layer

Avoid one giant chatbot.

Use bounded capabilities:

```text
AI Layer
├── Question Generation
├── Learning Plan Generation
├── Diagnostic Generation
├── Hints / Explanations
└── Semantic Retrieval
```

The model/provider should be replaceable.

Conceptually:

```text
AI Service
     ↓
Model Adapter
     ↓
Local LLM / Other Model
```

The application should not depend on one specific model implementation.

---

# 22. AI Assistance

AI assistance should respect the context in which it is being used.

## Practice

Can provide:

- Hints
- Explanations
- Guided help

## Graded assessment

Assistance should be restricted so that it does not invalidate the evidence being collected.

Possible controls:

```text
Disabled
Conceptual hint
Guided hint
Explanation after attempt
```

The exact UI can remain flexible, but the core principle is:

> **If AI assistance changes the meaning of an assessment, that usage must be controlled.**

---

# 23. Data Model — Conceptual

This is not a final SQL schema.

```text
User
 ├── Role
 ├── Profile
 └── Preferences

Class
 ├── Teacher
 └── Students

LearningSession
 ├── Topic
 ├── Objectives
 ├── Questions
 └── LearningPlan

Question
 ├── Concept
 ├── Bloom
 ├── Difficulty
 ├── Options
 └── Source

QuestionVariant
 └── Blueprint reference

Assessment
 └── Questions

Attempt
 ├── Student
 ├── Question
 ├── Answer
 ├── Result
 └── Timestamp

LearningEvidence
 ├── Student
 ├── Concept
 ├── Source
 ├── Result
 ├── Timestamp
 └── Signal metadata

LearningGap
 ├── Student
 ├── Concept
 └── Evidence references

Diagnostic
 └── Diagnostic Questions

Intervention
 ├── LearningGap
 ├── LearningPlan
 └── Activities

Reassessment
 └── New Evidence
```

---

# 24. End-to-End Product Flow

### Teacher

```text
Create learning session
        ↓
Add seed MCQs
        ↓
Select number of variants
        ↓
Select optional Bloom distribution
        ↓
Generate
        ↓
Questions stream in
        ↓
Review / edit
        ↓
Publish
```

### Student

```text
My Learning
     ↓
Practice Lab
     ↓
MCQ attempts
     ↓
Learning evidence
```

### Intelligence

```text
Evidence
   ↓
Recency + repeated pattern
   ↓
Candidate learning gap
   ↓
Student Intelligence
```

### Diagnosis

```text
Learning Gap
     ↓
Diagnostic Lab
     ↓
Targeted MCQs / coding
     ↓
Evidence
```

### Intervention

```text
Gap + Evidence
      ↓
AI Learning Plan
      ↓
Teacher Review
      ↓
Targeted Practice
      ↓
Reassessment
      ↓
Progress Lab
```

Everything connects back to the same evidence model.

---

# 25. UI / Design Direction

The existing OS-style concept remains the shell, but the UI is being redesigned rather than copied.

## Direction

- React
- React Bits for selected components/patterns
- Transition.dev / motion tooling where useful
- GoodFonts / selected typography
- Custom components for product-specific interactions

Libraries provide primitives; the product gets its own visual language.

## Custom components

Examples:

- Learning-gap cards
- Evidence panels
- Question review cards
- Streaming generation panel
- Count controls
- Bloom distribution control
- Concept heatmap
- Diagnostic builder
- Learning-plan builder
- Intervention timeline
- Progress comparison

### Design principle

Less decorative UI, more useful interaction.

The OS metaphor should make navigation and context clear, not become the gimmick.

---

# 26. Backend / Infrastructure Direction

The system moves away from Supabase.

```text
React
  ↓
Application Backend
  ↓
Domain Logic
  ├── Auth
  ├── Assessment
  ├── Learning
  ├── Diagnostics
  ├── Intervention
  └── AI
  ↓
PostgreSQL
  └── pgvector where useful
```

For streaming AI generation:

```text
WebSocket
   ↓
Queue
   ↓
AI Worker
   ↓
Validation
   ↓
PostgreSQL
   ↓
WebSocket events
```

The exact technologies for queue/state management remain WIP.

---

# 27. TestForge Components Worth Reusing

The old codebase should be treated as a source of working pieces, not as the structure we must preserve.

### Strong reuse

- Browser coding environment
- Autocomplete
- Syntax highlighting
- Editor behaviour
- Execution/output experience
- Useful question/assessment primitives

### Rework

- Business logic
- Data model
- Supabase integration
- AI integration
- Learning analytics
- Navigation
- Application boundaries
- Assessment interpretation

### Principle

**Reuse proven functionality. Refactor broken structure.**

Do not rewrite a good coding editor just because the surrounding application is being rebuilt.

---

# 28. Non-Goals / Scope Protection

Do not add complexity simply because the technology is available.

Explicitly avoid:

- Giant general-purpose chatbot
- Unlimited generation
- Unbounded retry loops
- Arbitrary free-form answer grading
- Oversized Settings app
- Mandatory vector search everywhere
- Separate duplicated intelligence pipelines
- Separate AI services for every tiny semantic operation
- Forcing agents into every workflow
- Analytics that exist only to make the product look bigger

---

# 29. Engineering Rules

1. **One product, one implementation.**
2. Apps are views/actions over shared learning data.
3. Build the core learning pipeline before duplicating business logic.
4. Every AI generation request has an explicit count and hard bound.
5. Generation streams validated results immediately.
6. Generation can be cancelled.
7. Every generated item has a bounded retry budget.
8. Partial results are persisted.
9. PostgreSQL is the source of truth.
10. pgvector is used where semantic similarity provides a real benefit.
11. Bloom is useful metadata, not the foundation of the intelligence engine.
12. Evidence is traceable and recency-aware.
13. Learning gaps are evidence-backed candidates, not magic scores.
14. Coding diagnostics rely on concrete challenge metadata and execution signals.
15. AI capabilities have explicit input/output contracts.
16. Models remain replaceable.
17. Reuse strong TestForge components; do not preserve bad architecture.
18. Custom UI components should solve real product problems.
19. Cut anything that adds significant complexity without strengthening the learning loop.

---

# 30. Core Product Statement

> **From a small set of teacher-created questions, the system builds a structured learning experience, observes student performance, identifies emerging learning difficulties, helps diagnose the underlying concept, delivers targeted learning actions, and measures improvement.**

The AI makes content creation and learning support faster.

**The learning loop is the product.**

---

## Final Status

**WORK IN PROGRESS.**

The product scope above is intended for the single hackathon build. Exact implementation details—database schema, queue technology, WebSocket implementation, model choice, component library usage, and service boundaries—can evolve during development without changing the core product direction.
