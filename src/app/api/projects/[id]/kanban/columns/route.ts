import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKanbanColumnSchema } from "@/lib/validators";
import { DEFAULT_KANBAN_COLUMNS } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let columns = await prisma.kanbanColumn.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
    });

    // Auto-seed default columns if none exist
    if (columns.length === 0) {
      await prisma.kanbanColumn.createMany({
        data: DEFAULT_KANBAN_COLUMNS.map((name, index) => ({
          projectId: id,
          name,
          sortOrder: index,
        })),
      });
      columns = await prisma.kanbanColumn.findMany({
        where: { projectId: id },
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json(columns);
  } catch (error) {
    console.error("GET /api/projects/[id]/kanban/columns error:", error);
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
    const result = createKanbanColumnSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If no sortOrder provided, append to end
    let sortOrder = result.data.sortOrder;
    if (sortOrder === undefined) {
      const maxCol = await prisma.kanbanColumn.findFirst({
        where: { projectId: id },
        orderBy: { sortOrder: "desc" },
      });
      sortOrder = (maxCol?.sortOrder ?? -1) + 1;
    }

    const column = await prisma.kanbanColumn.create({
      data: {
        projectId: id,
        name: result.data.name,
        color: result.data.color ?? "",
        wipLimit: result.data.wipLimit ?? 0,
        sortOrder,
      },
    });

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/kanban/columns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
