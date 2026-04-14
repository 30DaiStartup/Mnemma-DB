import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validators";
import { getDefaultPhases, ProjectType } from "@/types";

function parseProjectJson(project: Record<string, unknown>) {
  return {
    ...project,
    phaseConfig: JSON.parse((project.phaseConfig as string) || "[]"),
    metadata: JSON.parse((project.metadata as string) || "{}"),
    kanbanItems: ((project.kanbanItems as Record<string, unknown>[]) || []).map((item) => ({
      ...item,
      metadata: JSON.parse((item.metadata as string) || "{}"),
    })),
    transcriptSummaries: ((project.transcriptSummaries as Record<string, unknown>[]) || []).map((ts) => ({
      ...ts,
      participants: JSON.parse((ts.participants as string) || "[]"),
      actionItems: JSON.parse((ts.actionItems as string) || "[]"),
    })),
    metrics: ((project.metrics as Record<string, unknown>[]) || []).map((m) => ({
      ...m,
      history: JSON.parse((m.history as string) || "[]"),
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teamId = searchParams.get("teamId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (teamId) where.teamId = teamId;

    const projects = await prisma.project.findMany({
      where,
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    const parsed = projects.map((p: (typeof projects)[number]) => parseProjectJson(p as unknown as Record<string, unknown>));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Auto-set phaseConfig based on type if not provided
    if (!data.phaseConfig) {
      const phases = getDefaultPhases(data.type as ProjectType);
      data.phaseConfig = JSON.stringify(phases);
    }

    // Set initial phase to first phase name if not provided
    if (!data.phase && data.phaseConfig) {
      const phases = JSON.parse(data.phaseConfig);
      if (phases.length > 0) {
        data.phase = phases[0].name;
      }
    }

    const project = await prisma.project.create({
      data,
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
    });

    const parsed = parseProjectJson(project as unknown as Record<string, unknown>);

    return NextResponse.json(parsed, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
