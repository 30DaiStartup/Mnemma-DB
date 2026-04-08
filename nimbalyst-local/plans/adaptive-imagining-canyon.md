# Project Tracking Dashboard - Implementation Plan

## Context

The company needs a centralized dashboard to track AI-driven software and business projects. Currently, project status lives across scattered folders, Teams transcripts, and tribal knowledge. This dashboard will be the single source of truth showing what's active, what's in the backlog, and the health/progress of each project. It's designed for a team using Claude Code across multiple IDEs, with meetings captured in Teams/SharePoint.

**MVP Goal**: Dashboard with active project tiles, backlog list, and full project overview pages. Agent integrations and transcript automation are designed-for but built post-MVP.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | SQLite + Prisma ORM |
| Auth | NextAuth v5 + Microsoft Azure AD |
| UI | shadcn/ui + Tailwind CSS |
| Drag/Drop | @dnd-kit |
| Data Fetching | SWR |
| Validation | Zod |
| Deployment | Vercel (or Azure) |
| Team Roster | `data/team.yaml` config file |

---

## Project Structure

```
Dashboard/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── data/
│   └── team.yaml                    # Company roster
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout, providers, nav
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── projects/route.ts               # List/create
│   │   │   ├── projects/[id]/route.ts          # Get/update/delete
│   │   │   ├── projects/[id]/kanban/route.ts
│   │   │   ├── projects/[id]/kanban/reorder/route.ts
│   │   │   ├── projects/[id]/kanban/approve-all/route.ts
│   │   │   ├── projects/[id]/transcripts/route.ts
│   │   │   ├── projects/[id]/metrics/route.ts
│   │   │   ├── projects/[id]/objectives/route.ts
│   │   │   ├── projects/[id]/team/route.ts
│   │   │   ├── kanban-items/[id]/route.ts
│   │   │   ├── backlog/reorder/route.ts
│   │   │   ├── team/route.ts                   # Read YAML roster
│   │   │   └── ingest/                         # Agent endpoints (stubs)
│   │   │       ├── transcript/route.ts
│   │   │       └── metrics/route.ts
│   │   ├── projects/[id]/page.tsx              # Project overview
│   │   └── backlog/[id]/page.tsx               # Planning screen
│   ├── components/
│   │   ├── ui/                      # shadcn components
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── user-menu.tsx
│   │   ├── dashboard/
│   │   │   ├── project-grid.tsx     # Active tiles (drag/drop)
│   │   │   ├── project-tile.tsx
│   │   │   ├── backlog-list.tsx     # Backlog (drag/drop)
│   │   │   └── backlog-item.tsx
│   │   ├── project/
│   │   │   ├── phase-tracker.tsx
│   │   │   ├── status-tracker.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── kanban-card.tsx
│   │   │   ├── transcript-table.tsx
│   │   │   ├── metrics-section.tsx
│   │   │   ├── objectives-section.tsx
│   │   │   ├── team-bar.tsx
│   │   │   ├── new-indicator.tsx
│   │   │   └── dismissed-section.tsx
│   │   └── planning/
│   │       ├── planning-form.tsx
│   │       ├── objective-editor.tsx
│   │       ├── team-selector.tsx
│   │       └── activate-button.tsx
│   ├── lib/
│   │   ├── prisma.ts                # Singleton client
│   │   ├── auth.ts                  # NextAuth config
│   │   ├── team.ts                  # YAML roster loader
│   │   ├── utils.ts                 # cn() helper
│   │   └── validators.ts           # Zod schemas
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-kanban.ts
│   │   └── use-backlog.ts
│   └── types/
│       └── index.ts
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Data Model (Prisma Schema)

### Project
- `id`, `name`, `description`, `type` (technical/business/custom)
- `status`: backlog | active | completed | archived
- `phase`: string — from a configurable phase list per project type
- `phaseConfig`: JSON string — ordered array of phase definitions for this project
- `health`: on-track | at-risk | blocked
- `nextStep`: text
- `sortOrder`: int (drag/drop ordering)
- `metadata`: JSON string (flexible fields per project type)
- `leadId`: string (references team.yaml)
- Relations: kanbanItems, transcriptSummaries, metrics, objectives, teamAssignments

### KanbanItem
- `id`, `projectId`, `title`, `description`
- `column`: string (default columns + custom)
- `sortOrder`, `priority` (low/medium/high/critical), `assigneeId`
- `source`: manual | transcript
- `sourceId`: links to TranscriptSummary if auto-generated
- `isNew`: boolean — visual "new" indicator
- `approved`: boolean — false for auto-generated pending review
- `dismissed`: boolean — true for rejected items (hidden but kept)
- `metadata`: JSON

### TranscriptSummary
- `id`, `projectId`, `title`, `date`, `summary`
- `participants`: JSON array
- `actionItems`: JSON array
- `sourceFile`: path/URL to original
- `processed`: boolean

### Metric
- `id`, `projectId`, `name`, `value`, `unit`, `category`, `trend`
- `history`: JSON array of `{date, value}` data points
- Unique constraint on `[projectId, name]`

### Objective
- `id`, `projectId`, `title`, `description`
- `status`: not-started | in-progress | completed
- `sortOrder`

### TeamAssignment
- `id`, `projectId`, `memberId` (references team.yaml), `role`
- Unique constraint on `[projectId, memberId]`

### KanbanColumnConfig (stored in Project.metadata or separate field)
- Default columns: To Do, In Progress, Review, Done
- Projects can add custom columns

---

## Phase Definitions

### AI Software Projects (default)
1. **Discussion** — Problem definition, stakeholder alignment, transcript capture
2. **Prototype** — Rapid Claude-assisted prototype build
3. **Feedback** — Demo to stakeholders, gather input
4. **Iteration** — Refine based on feedback, multiple cycles
5. **Production** — Deploy, monitor, stabilize

### Business Projects (default)
1. **Discovery** — Research and context gathering (Claude-assisted)
2. **Planning** — Strategy and approach definition
3. **Drafting** — Create deliverables (docs, proposals, analyses)
4. **Review** — Stakeholder review and approval
5. **Implementation** — Execute on the plan

Projects store their phase config in `phaseConfig` JSON field, initialized from these templates but fully editable per project.

---

## Key Workflows

### Transcript → Kanban Pipeline
1. Agent POSTs to `/api/ingest/transcript` with `{projectId, title, date, summary, actionItems, sourceFile}`
2. API creates `TranscriptSummary` record
3. Each action item becomes a `KanbanItem` with `source: "transcript"`, `isNew: true`, `approved: false`
4. UI shows items with pulsing "New" badge and dotted border
5. User can: approve individually, approve all, or dismiss
6. Dismissed items move to collapsible "Dismissed" section at bottom of kanban

### Backlog → Active Activation
1. User drags backlog item to active grid, OR clicks "Activate" on planning screen
2. API sets `status: "active"`, `phase: first phase from phaseConfig`
3. Dashboard re-renders with new tile in grid

### Drag/Drop Reordering
- Backlog list: vertical sortable, PATCH `/api/backlog/reorder` with new order
- Kanban cards: sortable within columns + draggable across columns
- All use SWR optimistic updates (instant UI, async persist)

---

## Design

- **Default dark theme** with light mode toggle (shadcn theme system + `next-themes`)
- Style reference: Linear / Vercel dashboard aesthetic
- Subtle accent colors for phase badges and health indicators
- "New" items: pulsing dot + colored border (e.g., blue glow)
- Responsive but desktop-first (this is a work dashboard)

---

## Implementation Order

### Step 1: Scaffolding
- `create-next-app` with TypeScript + Tailwind + App Router
- Install dependencies (prisma, @dnd-kit/*, swr, zod, yaml, shadcn/ui, next-themes, lucide-react, date-fns)
- Initialize Prisma with SQLite, write schema, run initial migration
- Set up `src/lib/prisma.ts`, `src/lib/utils.ts`
- Create `data/team.yaml` with sample roster
- Create `src/lib/team.ts` YAML loader
- Configure shadcn/ui with dark theme
- Set up root layout with theme provider and app shell

### Step 2: API Layer
- Write Zod validators for all inputs
- Build all CRUD API routes (projects, kanban, transcripts, metrics, objectives, team)
- Build reorder and approve-all endpoints
- Stub ingest endpoints
- Write seed script with 3-4 sample projects (mix of types and statuses)

### Step 3: Main Dashboard Page
- Build `ProjectTile` component (name, lead, team avatars, phase badge, next step)
- Build `ProjectGrid` with @dnd-kit sortable grid
- Build `BacklogItem` and `BacklogList` with sortable vertical list
- Wire up dashboard page with server-side data fetch
- Implement drag-to-reorder and drag-to-activate

### Step 4: Project Overview Page
- `TeamBar` — avatars and names across top
- `PhaseTracker` — horizontal stepper showing project phases
- `StatusTracker` — health badge with dropdown
- `KanbanBoard` — full drag/drop with columns, cards, new indicators
- `TranscriptTable` — data table with approve/dismiss actions + approve-all
- `DismissedSection` — collapsible section for rejected items
- `MetricsSection` — stat cards with trend indicators
- `ObjectivesSection` — checklist with status toggles

### Step 5: Planning Screen
- `PlanningForm` — project details editing
- `ObjectiveEditor` — add/remove/reorder objectives
- `TeamSelector` — multi-select from YAML roster
- `ActivateButton` — convert backlog to active with confirmation

### Step 6: Auth
- Configure NextAuth v5 with Azure AD provider
- Add `middleware.ts` to protect routes (except `/api/ingest/*`)
- Add `UserMenu` component with sign in/out
- Add role-based guards (admin can delete projects, manage roster, etc.)

---

## Verification

After each step, verify by:

1. **Step 1**: `npm run dev` starts without errors, dark theme renders, Prisma Studio shows empty tables (`npx prisma studio`)
2. **Step 2**: Test API routes with curl/httpie — create project, add kanban items, reorder, verify seed data loads
3. **Step 3**: Dashboard shows seeded projects as tiles, backlog items below. Drag/drop reorders and persists on refresh
4. **Step 4**: Click a tile → overview page loads with all sections populated from seed data. Kanban drag/drop works. Approve/dismiss works on mock transcript items
5. **Step 5**: Click backlog item → planning screen loads. Can edit fields, select team, activate project (appears on dashboard)
6. **Step 6**: Unauthenticated users redirected to sign-in. Azure AD login works. Roles enforced

**End-to-end smoke test**: Create a project from backlog → activate it → add kanban items → change phase → verify all state persists across page refreshes.

---

## Sub-Agent Task List

Tasks are organized into **batches**. All tasks within a batch can run in parallel. A batch must complete before the next batch starts. Tasks within a batch are assigned to **tracks** — each track is one agent session working on non-overlapping files.

---

### Batch 0: Scaffolding (Sequential — single session)
> Must complete before any parallel work begins. Sets up the project skeleton all agents depend on.

- [ ] **0.1** Initialize Next.js project with `create-next-app` (TypeScript, Tailwind, App Router, src dir)
- [ ] **0.2** Install all dependencies: `prisma @prisma/client @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities swr zod yaml date-fns next-themes lucide-react`
- [ ] **0.3** Initialize shadcn/ui (`npx shadcn@latest init`) with dark theme, install base components: `button card badge avatar dropdown-menu dialog table input textarea select separator sheet tabs tooltip`
- [ ] **0.4** Write Prisma schema (`prisma/schema.prisma`) with all models (Project, KanbanItem, TranscriptSummary, Metric, Objective, TeamAssignment), run `prisma migrate dev --name init`
- [ ] **0.5** Create shared utilities:
  - `src/lib/prisma.ts` — Prisma singleton
  - `src/lib/utils.ts` — `cn()` helper
  - `src/types/index.ts` — shared TypeScript types for all models + API responses
  - `src/lib/validators.ts` — all Zod schemas for API input validation
  - `data/team.yaml` — sample company roster (8-10 people with ids, names, emails, roles, avatars)
  - `src/lib/team.ts` — YAML roster loader
- [ ] **0.6** Set up root layout (`src/app/layout.tsx`) with ThemeProvider, base app shell, dark/light toggle
- [ ] **0.7** Create `.env.local`, `.env.example`, `.gitignore`, initialize git repo

---

### Batch 1: API + Seed Data (3 parallel tracks)
> All API routes + seed data. No UI work yet — agents write API routes and test with curl.

**Track A — Project & Backlog APIs**
Files: `src/app/api/projects/`, `src/app/api/backlog/`, `src/app/api/team/`
- [ ] **1A.1** `GET/POST /api/projects` — list all (with `?status=` filter), create new project
- [ ] **1A.2** `GET/PATCH/DELETE /api/projects/[id]` — single project CRUD
- [ ] **1A.3** `PATCH /api/backlog/reorder` — batch reorder backlog items
- [ ] **1A.4** `GET /api/team` — parse and return `data/team.yaml` roster
- [ ] **1A.5** `GET/PUT /api/projects/[id]/team` — get/set team assignments for a project

**Track B — Kanban & Transcript APIs**
Files: `src/app/api/projects/[id]/kanban/`, `src/app/api/kanban-items/`, `src/app/api/projects/[id]/transcripts/`
- [ ] **1B.1** `GET/POST /api/projects/[id]/kanban` — list/create kanban items
- [ ] **1B.2** `PATCH /api/projects/[id]/kanban/reorder` — reorder within/across columns
- [ ] **1B.3** `POST /api/projects/[id]/kanban/approve-all` — approve all pending items
- [ ] **1B.4** `PATCH/DELETE /api/kanban-items/[id]` — update (move, approve, dismiss) or delete
- [ ] **1B.5** `GET/POST /api/projects/[id]/transcripts` — list/add transcript summaries

**Track C — Metrics, Objectives & Seed**
Files: `src/app/api/projects/[id]/metrics/`, `src/app/api/projects/[id]/objectives/`, `src/app/api/ingest/`, `prisma/seed.ts`
- [ ] **1C.1** `GET/POST/PATCH /api/projects/[id]/metrics` — CRUD + upsert metrics
- [ ] **1C.2** `GET/POST /api/projects/[id]/objectives` — CRUD objectives
- [ ] **1C.3** `POST /api/ingest/transcript` — stub for agent transcript ingestion
- [ ] **1C.4** `POST /api/ingest/metrics` — stub for agent metrics push
- [ ] **1C.5** Write `prisma/seed.ts` — 4 sample projects (2 active software, 1 active business, 1 backlog), each with kanban items (some auto-generated with `isNew: true`), transcript summaries, metrics, objectives, and team assignments. Run seed.

---

### Batch 2: UI Components + Pages (3 parallel tracks)
> Build all pages and components. Each track owns a distinct page with no file overlap.

**Track D — Main Dashboard Page**
Files: `src/app/page.tsx`, `src/components/dashboard/`, `src/hooks/use-projects.ts`, `src/hooks/use-backlog.ts`
- [ ] **2D.1** Build `ProjectTile` — card showing name, lead, team avatars (max 4 + overflow), phase badge, next step text. Link to `/projects/[id]`
- [ ] **2D.2** Build `ProjectGrid` — responsive grid of `ProjectTile`s using @dnd-kit sortable
- [ ] **2D.3** Build `BacklogItem` — compact row with name, type badge, drag handle. Link to `/backlog/[id]`
- [ ] **2D.4** Build `BacklogList` — @dnd-kit sortable vertical list of `BacklogItem`s
- [ ] **2D.5** Wire `src/app/page.tsx` — server fetch active + backlog projects, render grid + list, implement drag-to-reorder and drag-from-backlog-to-activate
- [ ] **2D.6** Build `src/hooks/use-projects.ts` and `src/hooks/use-backlog.ts` — SWR hooks for mutations + optimistic updates

**Track E — Project Overview Page**
Files: `src/app/projects/[id]/page.tsx`, `src/components/project/`, `src/hooks/use-kanban.ts`
- [ ] **2E.1** Build `TeamBar` — horizontal row of team member avatars + names, lead highlighted
- [ ] **2E.2** Build `PhaseTracker` — horizontal stepper with phase names, current phase highlighted, clickable to change
- [ ] **2E.3** Build `StatusTracker` — colored health badge (green/yellow/red) with dropdown to change status
- [ ] **2E.4** Build `KanbanBoard`, `KanbanColumn`, `KanbanCard` — full @dnd-kit drag/drop board. Cards show title, assignee avatar, priority badge. Auto-generated cards show `NewIndicator` (pulsing blue dot + dashed border) with approve/dismiss buttons
- [ ] **2E.5** Build `TranscriptTable` — shadcn DataTable with columns: date, title, summary (truncated), participants count, action items count. Row-level approve/dismiss for generated items. "Approve All" button in header
- [ ] **2E.6** Build `DismissedSection` — collapsible section showing dismissed items with option to restore
- [ ] **2E.7** Build `MetricsSection` — grid of stat cards showing metric name, value, unit, trend arrow (up/down/stable)
- [ ] **2E.8** Build `ObjectivesSection` — checklist with title, description, status toggle (not started → in progress → completed)
- [ ] **2E.9** Wire `src/app/projects/[id]/page.tsx` — server fetch project with all relations, compose all sections
- [ ] **2E.10** Build `src/hooks/use-kanban.ts` — SWR hook for kanban mutations + optimistic drag/drop

**Track F — Planning Screen + Layout**
Files: `src/app/backlog/[id]/page.tsx`, `src/components/planning/`, `src/components/layout/`
- [ ] **2F.1** Build `AppShell` — sidebar/header layout with nav links (Dashboard, theme toggle)
- [ ] **2F.2** Build `ThemeToggle` — dark/light mode switch using `next-themes`
- [ ] **2F.3** Build `PlanningForm` — editable fields: name, description, type (dropdown: technical/business/custom), custom metadata fields, notes section
- [ ] **2F.4** Build `ObjectiveEditor` — add/remove/reorder objectives inline, each with title + description + target metric
- [ ] **2F.5** Build `TeamSelector` — searchable multi-select from YAML roster, shows avatars + names, designate one as lead
- [ ] **2F.6** Build `ActivateButton` — confirmation dialog, calls PATCH to activate, redirects to project overview
- [ ] **2F.7** Wire `src/app/backlog/[id]/page.tsx` — server fetch backlog item, render planning form + team selector + objectives + activate

---

### Batch 3: Integration & Polish (2 parallel tracks)
> Cross-cutting concerns, auth, and final polish.

**Track G — Auth & Middleware**
Files: `src/lib/auth.ts`, `src/app/api/auth/`, `middleware.ts`, `src/components/layout/user-menu.tsx`
- [ ] **3G.1** Configure NextAuth v5 with Azure AD provider in `src/lib/auth.ts`
- [ ] **3G.2** Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] **3G.3** Create `middleware.ts` — protect all routes except `/api/ingest/*` and `/api/auth/*`
- [ ] **3G.4** Build `UserMenu` component — show user name/avatar, role, sign out button. Add to AppShell
- [ ] **3G.5** Add role-based guards to destructive API routes (delete project = admin only, etc.)

**Track H — Polish, Dark Theme & Testing**
Files: `src/app/globals.css`, component style tweaks, seed data validation
- [ ] **3H.1** Refine dark theme — ensure all shadcn components render correctly in dark mode, adjust contrast and accent colors
- [ ] **3H.2** Add loading states (skeleton loaders) for dashboard grid, kanban board, and transcript table
- [ ] **3H.3** Add error boundaries and empty states ("No active projects", "No kanban items", etc.)
- [ ] **3H.4** End-to-end smoke test: create from backlog → activate → add kanban items → change phase → approve transcript items → verify persistence
- [ ] **3H.5** Responsive adjustments — ensure dashboard and overview pages work on smaller screens (tablet minimum)

---

### Batch Summary

| Batch | Tracks | Tasks | Dependencies |
|-------|--------|-------|-------------|
| 0 | 1 (sequential) | 7 | None |
| 1 | 3 parallel (A, B, C) | 15 | Batch 0 complete |
| 2 | 3 parallel (D, E, F) | 23 | Batch 1 complete |
| 3 | 2 parallel (G, H) | 10 | Batch 2 complete |
| **Total** | | **55 tasks** | |

### Agent Session Instructions

Each track should be launched as a separate Claude Code session with these guidelines:
- **Read the full plan first** — especially the Tech Stack, Data Model, and Project Structure sections
- **Stay within your track's file boundaries** — do not modify files owned by another track
- **Use the shared types** from `src/types/index.ts` and validators from `src/lib/validators.ts`
- **Use the Prisma client** from `src/lib/prisma.ts` for all DB access
- **Follow shadcn/ui patterns** — use existing components from `src/components/ui/`
- **Dark theme by default** — all components must work in both dark and light mode
- **Commit after completing each task** with message format: `[Track X] Task X.X: description`

---

## Future (Post-MVP, designed-for)

- File watcher agent pushing to `/api/ingest/metrics`
- Transcript processing agent pushing to `/api/ingest/transcript`
- Claude Code usage log parser (token spend, model tracking)
- LOC counter agent
- Template folder → auto-register new project
- SharePoint/OneDrive transcript automation
- Real-time updates via SSE or polling
