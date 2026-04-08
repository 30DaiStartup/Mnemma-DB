import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createObjectiveSchema, updateObjectiveSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const objectives = await prisma.objective.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(objectives);
  } catch (error) {
    console.error("GET /api/projects/[id]/objectives error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = createObjectiveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const objective = await prisma.objective.create({
      data: {
        ...result.data,
        projectId: id,
      },
    });

    return NextResponse.json(objective, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/objectives error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Objective id is required" },
        { status: 400 }
      );
    }

    const result = updateObjectiveSchema.safeParse(fields);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.objective.findFirst({
      where: { id, projectId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 }
      );
    }

    const objective = await prisma.objective.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(objective);
  } catch (error) {
    console.error("PATCH /api/projects/[id]/objectives error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
