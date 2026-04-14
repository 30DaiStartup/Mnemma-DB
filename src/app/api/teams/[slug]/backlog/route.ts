import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const team = await prisma.team.findUnique({ where: { slug } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { teamId: team.id, status: "backlog" },
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    const parsed = projects.map((p) => ({
      ...p,
      phaseConfig: JSON.parse((p.phaseConfig as string) || "[]"),
      metadata: JSON.parse((p.metadata as string) || "{}"),
      kanbanItems: p.kanbanItems.map((item) => ({
        ...item,
        metadata: JSON.parse((item.metadata as string) || "{}"),
      })),
      transcriptSummaries: p.transcriptSummaries.map((ts) => ({
        ...ts,
        participants: JSON.parse((ts.participants as string) || "[]"),
        actionItems: JSON.parse((ts.actionItems as string) || "[]"),
      })),
      metrics: p.metrics.map((m) => ({
        ...m,
        history: JSON.parse((m.history as string) || "[]"),
      })),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/teams/[slug]/backlog error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team backlog" },
      { status: 500 }
    );
  }
}
