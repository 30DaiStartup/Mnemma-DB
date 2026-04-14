import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reorderKanbanSubtasksSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    const body = await request.json();
    const result = reorderKanbanSubtasksSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      result.data.items.map((item) =>
        prisma.kanbanSubtask.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    const subtasks = await prisma.kanbanSubtask.findMany({
      where: { itemId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error("PATCH /api/kanban-items/[id]/subtasks/reorder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
