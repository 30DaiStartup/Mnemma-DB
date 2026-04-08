export const PROJECT_TYPES = ["technical", "business", "custom"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = ["backlog", "active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const HEALTH_STATUSES = ["on-track", "at-risk", "blocked"] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const KANBAN_SOURCES = ["manual", "transcript"] as const;
export type KanbanSource = (typeof KANBAN_SOURCES)[number];

export const OBJECTIVE_STATUSES = ["not-started", "in-progress", "completed"] as const;
export type ObjectiveStatus = (typeof OBJECTIVE_STATUSES)[number];

export const TRENDS = ["up", "down", "stable"] as const;
export type Trend = (typeof TRENDS)[number];

export const DEFAULT_KANBAN_COLUMNS = ["To Do", "In Progress", "Review", "Done"];

export interface PhaseDefinition {
  name: string;
  description: string;
}

export const AI_SOFTWARE_PHASES: PhaseDefinition[] = [
  { name: "Discussion", description: "Problem definition, stakeholder alignment, transcript capture" },
  { name: "Prototype", description: "Rapid Claude-assisted prototype build" },
  { name: "Feedback", description: "Demo to stakeholders, gather input" },
  { name: "Iteration", description: "Refine based on feedback, multiple cycles" },
  { name: "Production", description: "Deploy, monitor, stabilize" },
];

export const BUSINESS_PHASES: PhaseDefinition[] = [
  { name: "Discovery", description: "Research and context gathering" },
  { name: "Planning", description: "Strategy and approach definition" },
  { name: "Drafting", description: "Create deliverables" },
  { name: "Review", description: "Stakeholder review and approval" },
  { name: "Implementation", description: "Execute on the plan" },
];

export function getDefaultPhases(type: ProjectType): PhaseDefinition[] {
  switch (type) {
    case "technical":
      return AI_SOFTWARE_PHASES;
    case "business":
      return BUSINESS_PHASES;
    case "custom":
      return AI_SOFTWARE_PHASES;
  }
}

// API response types
export interface ProjectWithRelations {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  phase: string;
  phaseConfig: PhaseDefinition[];
  health: string;
  nextStep: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
  leadId: string;
  kanbanItems: KanbanItemData[];
  transcriptSummaries: TranscriptSummaryData[];
  metrics: MetricData[];
  objectives: ObjectiveData[];
  teamAssignments: TeamAssignmentData[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanItemData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: string;
  sortOrder: number;
  priority: string;
  assigneeId: string;
  source: string;
  sourceId: string;
  isNew: boolean;
  approved: boolean;
  dismissed: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSummaryData {
  id: string;
  projectId: string;
  title: string;
  date: string;
  summary: string;
  participants: string[];
  actionItems: string[];
  sourceFile: string;
  processed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetricData {
  id: string;
  projectId: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  trend: string;
  history: { date: string; value: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamAssignmentData {
  id: string;
  projectId: string;
  memberId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
