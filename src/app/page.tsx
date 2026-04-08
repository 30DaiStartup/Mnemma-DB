import { prisma } from "@/lib/prisma";
import { getTeam } from "@/lib/team";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { ProjectWithRelations, PhaseDefinition } from "@/types";

function parseProjectJson(
  project: Record<string, unknown>
): ProjectWithRelations {
  return {
    ...project,
    phaseConfig: JSON.parse(
      (project.phaseConfig as string) || "[]"
    ) as PhaseDefinition[],
    metadata: JSON.parse(
      (project.metadata as string) || "{}"
    ) as Record<string, unknown>,
    kanbanItems: (
      (project.kanbanItems as Record<string, unknown>[]) || []
    ).map((item) => ({
      ...item,
      metadata: JSON.parse((item.metadata as string) || "{}"),
    })),
    transcriptSummaries: (
      (project.transcriptSummaries as Record<string, unknown>[]) || []
    ).map((ts) => ({
      ...ts,
      participants: JSON.parse((ts.participants as string) || "[]"),
      actionItems: JSON.parse((ts.actionItems as string) || "[]"),
    })),
    metrics: (
      (project.metrics as Record<string, unknown>[]) || []
    ).map((m) => ({
      ...m,
      history: JSON.parse((m.history as string) || "[]"),
    })),
  } as ProjectWithRelations;
}

export default async function DashboardPage() {
  const [activeRaw, backlogRaw] = await Promise.all([
    prisma.project.findMany({
      where: { status: "active" },
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "backlog" },
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const activeProjects = activeRaw.map((p: unknown) =>
    parseProjectJson(p as Record<string, unknown>)
  );
  const backlogProjects = backlogRaw.map((p: unknown) =>
    parseProjectJson(p as Record<string, unknown>)
  );
  const teamMembers = getTeam();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Project Dashboard
      </h1>
      <DashboardClient
        initialActive={activeProjects}
        initialBacklog={backlogProjects}
        teamMembers={teamMembers}
      />
    </main>
  );
}
