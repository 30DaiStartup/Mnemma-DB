import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validators";
import { auth, isAdmin } from "@/lib/auth";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const parsed = parseProjectJson(project as unknown as Record<string, unknown>);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: result.data,
      include: {
        kanbanItems: true,
        transcriptSummaries: true,
        metrics: true,
        objectives: true,
        teamAssignments: true,
      },
    });

    const parsed = parseProjectJson(project as unknown as Record<string, unknown>);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin-only: check role before allowing delete
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
