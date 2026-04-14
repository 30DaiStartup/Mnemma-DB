import { prisma } from "@/lib/prisma";
import { getTeamGroups, getTeamMember } from "@/lib/team";
import { TeamCard } from "@/components/teams/team-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TeamsPage() {
  const dbTeams = await prisma.team.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { projects: true } },
      projects: {
        where: { status: "backlog" },
        select: { id: true },
      },
    },
  });

  const yamlGroups = getTeamGroups();

  const teams = dbTeams.map((team) => {
    const yamlGroup = yamlGroups.find((g) => g.id === team.slug);
    const memberIds = yamlGroup?.members || [];
    const members = memberIds
      .map((id) => getTeamMember(id))
      .filter(Boolean) as NonNullable<ReturnType<typeof getTeamMember>>[];

    return {
      slug: team.slug,
      name: team.name,
      description: team.description,
      projectCount: team._count.projects,
      backlogCount: team.projects.length,
      members,
    };
  });

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
        <h1 className="text-xl font-semibold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">
          View team backlogs and manage team-scoped projects
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.slug} team={team} />
        ))}
      </div>
    </div>
  );
}
