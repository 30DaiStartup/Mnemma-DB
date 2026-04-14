import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateKanbanColumnSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id, columnId } = await params;

    const column = await prisma.kanbanColumn.findFirst({
      where: { id: columnId, projectId: id },
    });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateKanbanColumnSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If renaming, update all items that reference the old column name
    if (result.data.name && result.data.name !== column.name) {
      await prisma.kanbanItem.updateMany({
        where: { projectId: id, column: column.name },
        data: { column: result.data.name },
      });
    }

    const updated = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/projects/[id]/kanban/columns/[columnId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id, columnId } = await params;

    const column = await prisma.kanbanColumn.findFirst({
      where: { id: columnId, projectId: id },
    });
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Check if column has items
    const itemCount = await prisma.kanbanItem.count({
      where: { projectId: id, column: column.name },
    });
    if (itemCount > 0) {
      return NextResponse.json(
        { error: "Column has items. Move or delete them first." },
        { status: 409 }
      );
    }

    await prisma.kanbanColumn.delete({ where: { id: columnId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id]/kanban/columns/[columnId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
