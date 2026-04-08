import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKanbanItemSchema } from "@/lib/validators";

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

    const includeDismissed =
      request.nextUrl.searchParams.get("includeDismissed") === "true";

    const items = await prisma.kanbanItem.findMany({
      where: {
        projectId: id,
        ...(includeDismissed ? {} : { dismissed: false }),
      },
      orderBy: { sortOrder: "asc" },
    });

    const parsed = items.map((item: { metadata: string;[key: string]: unknown }) => ({
      ...item,
      metadata: JSON.parse(item.metadata),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/projects/[id]/kanban error:", error);
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
    const result = createKanbanItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.kanbanItem.create({
      data: {
        ...result.data,
        projectId: id,
      },
    });

    return NextResponse.json(
      { ...item, metadata: JSON.parse(item.metadata) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects/[id]/kanban error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
