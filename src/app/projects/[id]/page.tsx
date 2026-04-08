import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTeam } from "@/lib/team";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TeamBar } from "@/components/project/team-bar";
import { PhaseTracker } from "@/components/project/phase-tracker";
import { StatusTracker } from "@/components/project/status-tracker";
import { KanbanSection } from "@/components/project/kanban-section";
import { TranscriptTable } from "@/components/project/transcript-table";
import { MetricsSection } from "@/components/project/metrics-section";
import { ObjectivesSection } from "@/components/project/objectives-section";
import type {
  PhaseDefinition,
  HealthStatus,
  KanbanItemData,
  TranscriptSummaryData,
  MetricData,
  ObjectiveData,
  TeamAssignmentData,
} from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      kanbanItems: { orderBy: { sortOrder: "asc" } },
      transcriptSummaries: { orderBy: { date: "desc" } },
      metrics: true,
      objectives: { orderBy: { sortOrder: "asc" } },
      teamAssignments: true,
    },
  });

  if (!project) {
    notFound();
  }

  const teamMembers = getTeam();

  // Parse JSON fields
  const phaseConfig: PhaseDefinition[] = JSON.parse(
    project.phaseConfig || "[]"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kanbanItems: KanbanItemData[] = project.kanbanItems.map((item: any) => ({
    id: item.id,
    projectId: item.projectId,
    title: item.title,
    description: item.description,
    column: item.column,
    sortOrder: item.sortOrder,
    priority: item.priority,
    assigneeId: item.assigneeId,
    source: item.source,
    sourceId: item.sourceId,
    isNew: item.isNew,
    approved: item.approved,
    dismissed: item.dismissed,
    metadata: JSON.parse(item.metadata || "{}"),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const transcripts: TranscriptSummaryData[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project.transcriptSummaries.map((t: any) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      date: t.date.toISOString(),
      summary: t.summary,
      participants: JSON.parse(t.participants || "[]"),
      actionItems: JSON.parse(t.actionItems || "[]"),
      sourceFile: t.sourceFile,
      processed: t.processed,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics: MetricData[] = project.metrics.map((m: any) => ({
    id: m.id,
    projectId: m.projectId,
    name: m.name,
    value: m.value,
    unit: m.unit,
    category: m.category,
    trend: m.trend,
    history: JSON.parse(m.history || "[]"),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectives: ObjectiveData[] = project.objectives.map((o: any) => ({
    id: o.id,
    projectId: o.projectId,
    title: o.title,
    description: o.description,
    status: o.status,
    sortOrder: o.sortOrder,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamAssignments: TeamAssignmentData[] = project.teamAssignments.map(
    (ta: any) => ({
      id: ta.id,
      projectId: ta.projectId,
      memberId: ta.memberId,
      role: ta.role,
      createdAt: ta.createdAt.toISOString(),
      updatedAt: ta.updatedAt.toISOString(),
    })
  );

  return (
    <div className="flex-1 container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Project header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
          <StatusTracker
            health={project.health as HealthStatus}
            nextStep={project.nextStep}
            projectId={project.id}
          />
        </div>

        {/* Team bar */}
        <TeamBar
          teamAssignments={teamAssignments}
          teamMembers={teamMembers}
          leadId={project.leadId}
        />

        {/* Phase tracker */}
        {phaseConfig.length > 0 && (
          <PhaseTracker
            phases={phaseConfig}
            currentPhase={project.phase}
            projectId={project.id}
          />
        )}
      </div>

      <Separator />

      {/* Tabbed content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcripts">
            Transcripts
            {transcripts.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({transcripts.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <KanbanSection
            projectId={project.id}
            initialItems={kanbanItems}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="transcripts" className="mt-4">
          <TranscriptTable transcripts={transcripts} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsSection metrics={metrics} />
        </TabsContent>

        <TabsContent value="objectives" className="mt-4">
          <ObjectivesSection
            objectives={objectives}
            projectId={project.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
