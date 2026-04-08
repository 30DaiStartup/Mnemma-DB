import { z } from "zod";

// Project validators
export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(""),
  type: z.enum(["technical", "business", "custom"]).optional().default("technical"),
  status: z.enum(["backlog", "active", "completed", "archived"]).optional().default("backlog"),
  phase: z.string().optional().default(""),
  phaseConfig: z.string().optional(), // JSON string
  health: z.enum(["on-track", "at-risk", "blocked"]).optional().default("on-track"),
  nextStep: z.string().optional().default(""),
  sortOrder: z.number().int().optional().default(0),
  metadata: z.string().optional().default("{}"),
  leadId: z.string().optional().default(""),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(["technical", "business", "custom"]).optional(),
  status: z.enum(["backlog", "active", "completed", "archived"]).optional(),
  phase: z.string().optional(),
  phaseConfig: z.string().optional(),
  health: z.enum(["on-track", "at-risk", "blocked"]).optional(),
  nextStep: z.string().optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.string().optional(),
  leadId: z.string().optional(),
});

// Kanban validators
export const createKanbanItemSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional().default(""),
  column: z.string().optional().default("To Do"),
  sortOrder: z.number().int().optional().default(0),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  assigneeId: z.string().optional().default(""),
  source: z.enum(["manual", "transcript"]).optional().default("manual"),
  sourceId: z.string().optional().default(""),
  isNew: z.boolean().optional().default(false),
  approved: z.boolean().optional().default(true),
  metadata: z.string().optional().default("{}"),
});

export const updateKanbanItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  column: z.string().optional(),
  sortOrder: z.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assigneeId: z.string().optional(),
  isNew: z.boolean().optional(),
  approved: z.boolean().optional(),
  dismissed: z.boolean().optional(),
  metadata: z.string().optional(),
});

export const reorderKanbanSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      column: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

// Transcript validators
export const createTranscriptSchema = z.object({
  title: z.string().min(1).max(500),
  date: z.string(), // ISO date string
  summary: z.string().optional().default(""),
  participants: z.string().optional().default("[]"),
  actionItems: z.string().optional().default("[]"),
  sourceFile: z.string().optional().default(""),
});

// Metric validators
export const createMetricSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.number(),
  unit: z.string().optional().default(""),
  category: z.string().optional().default(""),
  trend: z.enum(["up", "down", "stable"]).optional().default("stable"),
  history: z.string().optional().default("[]"),
});

export const updateMetricSchema = z.object({
  value: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  trend: z.enum(["up", "down", "stable"]).optional(),
  history: z.string().optional(),
});

// Objective validators
export const createObjectiveSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional().default(""),
  status: z.enum(["not-started", "in-progress", "completed"]).optional().default("not-started"),
  sortOrder: z.number().int().optional().default(0),
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.enum(["not-started", "in-progress", "completed"]).optional(),
  sortOrder: z.number().int().optional(),
});

// Team assignment validators
export const teamAssignmentSchema = z.object({
  members: z.array(
    z.object({
      memberId: z.string().min(1),
      role: z.string().optional().default("member"),
    })
  ),
  leadId: z.string().optional(),
});

// Backlog reorder
export const reorderBacklogSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

// Ingest validators
export const ingestTranscriptSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  date: z.string(),
  summary: z.string().optional().default(""),
  actionItems: z.array(z.string()).optional().default([]),
  sourceFile: z.string().optional().default(""),
  participants: z.array(z.string()).optional().default([]),
});

export const ingestMetricsSchema = z.object({
  projectId: z.string().min(1),
  metrics: z.array(
    z.object({
      name: z.string().min(1),
      value: z.number(),
      unit: z.string().optional().default(""),
      category: z.string().optional().default(""),
    })
  ),
});
