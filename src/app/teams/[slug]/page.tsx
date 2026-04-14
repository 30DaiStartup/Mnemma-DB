import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTeam, getTeamGroups, getTeamMember } from "@/lib/team";
import { ArrowLeft } from "lucide-react";
import { TeamBacklogClient } from "@/components/teams/team-backlog-client";
import type { ProjectWithRelations, PhaseDefinition } from "@/types";

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;

  const team = await prisma.team.findUnique({ where: { slug } });
  if (!team) {
    redirect("/teams");
  }

  const yamlGroups = getTeamGroups();
  const yamlGroup = yamlGroups.find((g) => g.id === slug);
  const memberIds = yamlGroup?.members || [];
  const members = memberIds
    .map((id) => getTeamMember(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getTeamMember>>[];

  // Fetch both backlog and active projects for this team
  const [backlogRaw, activeRaw] = await Promise.all([
    prisma.project.findMany({
      where: { teamId: team.id, status: "backlog" },
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
      where: { teamId: team.id, status: "active" },
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

  function parseProject(p: Record<string, unknown>): ProjectWithRelations {
    return {
      ...p,
      phaseConfig: JSON.parse((p.phaseConfig as string) || "[]") as PhaseDefinition[],
      metadata: JSON.parse((p.metadata as string) || "{}") as Record<string, unknown>,
      kanbanItems: ((p.kanbanItems as Record<string, unknown>[]) || []).map((item) => ({
        ...item,
        metadata: JSON.parse((item.metadata as string) || "{}"),
      })),
      transcriptSummaries: ((p.transcriptSummaries as Record<string, unknown>[]) || []).map((ts) => ({
        ...ts,
        participants: JSON.parse((ts.participants as string) || "[]"),
        actionItems: JSON.parse((ts.actionItems as string) || "[]"),
      })),
      metrics: ((p.metrics as Record<string, unknown>[]) || []).map((m) => ({
        ...m,
        history: JSON.parse((m.history as string) || "[]"),
      })),
    } as ProjectWithRelations;
  }

  const backlogProjects = backlogRaw.map((p) => parseProject(p as unknown as Record<string, unknown>));
  const activeProjects = activeRaw.map((p) => parseProject(p as unknown as Record<string, unknown>));
  const teamMembers = getTeam();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-1">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back to Teams
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{team.name}</h1>
        <p className="text-sm text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""} &middot;{" "}
          {activeProjects.length} active &middot; {backlogProjects.length} in backlog
        </p>
      </div>

      {/* Team members */}
      <div className="mb-6 flex flex-wrap gap-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs"
          >
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-medium">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span>{member.name}</span>
            <span className="text-muted-foreground">{member.role}</span>
          </div>
        ))}
      </div>

      <TeamBacklogClient
        slug={slug}
        initialBacklog={backlogProjects}
        activeProjects={activeProjects}
        teamMembers={teamMembers}
      />
    </div>
  );
}
