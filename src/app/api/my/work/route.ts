import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMemberId } from "@/lib/current-user";

export async function GET() {
  try {
    const memberId = getCurrentMemberId();

    // Find projects where user is assigned or is lead
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { teamAssignments: { some: { memberId } } },
          { leadId: memberId },
        ],
      },
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Find kanban items assigned to user across all projects
    const assignedItems = await prisma.kanbanItem.findMany({
      where: { assigneeId: memberId },
      include: {
        project: { select: { id: true, name: true } },
        labels: { include: { label: true } },
        subtasks: true,
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

    return NextResponse.json({
      projects: parsed,
      assignedItems: assignedItems.map((item) => ({
        ...item,
        metadata: JSON.parse((item.metadata as string) || "{}"),
        labels: item.labels.map((l) => l.label),
        subtaskCount: item.subtasks.length,
        subtaskCompletedCount: item.subtasks.filter((s) => s.completed).length,
      })),
    });
  } catch (error) {
    console.error("GET /api/my/work error:", error);
    return NextResponse.json(
      { error: "Failed to fetch my work" },
      { status: 500 }
    );
  }
}
