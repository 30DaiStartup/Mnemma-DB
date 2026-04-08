import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTeam } from "@/lib/team";
import { ArrowLeft } from "lucide-react";
import { PlanningForm } from "@/components/planning/planning-form";
import { ObjectiveEditor } from "@/components/planning/objective-editor";
import { TeamSelector } from "@/components/planning/team-selector";
import { ActivateButton } from "@/components/planning/activate-button";
import type {
  ProjectWithRelations,
  PhaseDefinition,
  ObjectiveData,
  TeamAssignmentData,
} from "@/types";
import { getDefaultPhases } from "@/types";

interface BacklogPageProps {
  params: Promise<{ id: string }>;
}

export default async function BacklogPage({ params }: BacklogPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      objectives: { orderBy: { sortOrder: "asc" } },
      teamAssignments: true,
    },
  });

  if (!project) {
    redirect("/");
  }

  if (project.status !== "backlog") {
    redirect(`/projects/${project.id}`);
  }

  const roster = getTeam();

  // Parse JSON fields
  const phaseConfig: PhaseDefinition[] = (() => {
    try {
      const parsed = JSON.parse((project.phaseConfig as string) || "[]");
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : getDefaultPhases(project.type as "technical" | "business" | "custom");
    } catch {
      return getDefaultPhases(project.type as "technical" | "business" | "custom");
    }
  })();

  const metadata: Record<string, unknown> = (() => {
    try {
      return JSON.parse((project.metadata as string) || "{}");
    } catch {
      return {};
    }
  })();

  const projectData: ProjectWithRelations = {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    status: project.status,
    phase: project.phase,
    phaseConfig,
    health: project.health,
    nextStep: project.nextStep,
    sortOrder: project.sortOrder,
    metadata,
    leadId: project.leadId,
    kanbanItems: [],
    transcriptSummaries: [],
    metrics: [],
    objectives: project.objectives as unknown as ObjectiveData[],
    teamAssignments: project.teamAssignments as unknown as TeamAssignmentData[],
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          {project.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your project before activation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column: Project form */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4">
            <PlanningForm project={projectData} />
          </div>
        </div>

        {/* Right column: Team, Objectives, Activate */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4">
            <TeamSelector
              projectId={project.id}
              roster={roster}
              initialAssignments={
                project.teamAssignments as unknown as TeamAssignmentData[]
              }
              initialLeadId={project.leadId}
            />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <ObjectiveEditor
              projectId={project.id}
              initialObjectives={
                project.objectives as unknown as ObjectiveData[]
              }
            />
          </div>

          <ActivateButton
            projectId={project.id}
            projectName={project.name}
            teamCount={project.teamAssignments.length}
            objectiveCount={project.objectives.length}
            phases={phaseConfig}
          />
        </div>
      </div>
    </div>
  );
}
