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
  teamId: z.string().nullable().optional(),
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
  teamId: z.string().nullable().optional(),
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
  dueDate: z.string().nullable().optional(),
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

// Kanban column validators
export const createKanbanColumnSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().optional().default(""),
  sortOrder: z.number().int().optional(),
  wipLimit: z.number().int().min(0).optional().default(0),
});

export const updateKanbanColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
  wipLimit: z.number().int().min(0).optional(),
});

export const reorderKanbanColumnsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

// Kanban label validators
export const createKanbanLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional().default("#3b82f6"),
});

export const updateKanbanLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

// Kanban subtask validators
export const createKanbanSubtaskSchema = z.object({
  title: z.string().min(1).max(500),
  sortOrder: z.number().int().optional().default(0),
});

export const updateKanbanSubtaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const reorderKanbanSubtasksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

// Kanban activity validators
export const createKanbanCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  actorId: z.string().optional().default(""),
});

// Kanban bulk action validators
export const bulkUpdateKanbanItemsSchema = z.object({
  ids: z.array(z.string()).min(1),
  update: z.object({
    column: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  }),
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

// Personal idea validators
export const createPersonalIdeaSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  sortOrder: z.number().int().optional().default(0),
});

export const updatePersonalIdeaSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["idea", "ready", "promoted", "discarded"]).optional(),
  sortOrder: z.number().int().optional(),
});

export const promoteIdeaSchema = z.object({
  teamId: z.string().min(1),
});

// Team backlog reorder
export const reorderTeamBacklogSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});
