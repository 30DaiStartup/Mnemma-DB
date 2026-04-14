import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTeamGroups, getTeamMember } from "@/lib/team";

export async function GET() {
  try {
    const dbTeams = await prisma.team.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { projects: true } } },
    });

    const yamlGroups = getTeamGroups();

    const teams = dbTeams.map((team) => {
      const yamlGroup = yamlGroups.find((g) => g.id === team.slug);
      const memberIds = yamlGroup?.members || [];
      const members = memberIds
        .map((id) => getTeamMember(id))
        .filter(Boolean);

      return {
        id: team.id,
        slug: team.slug,
        name: team.name,
        description: team.description,
        sortOrder: team.sortOrder,
        projectCount: team._count.projects,
        memberIds,
        members,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
