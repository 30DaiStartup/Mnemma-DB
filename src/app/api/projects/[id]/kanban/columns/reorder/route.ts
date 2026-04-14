import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reorderKanbanColumnsSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const result = reorderKanbanColumnsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      result.data.items.map((item) =>
        prisma.kanbanColumn.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    const columns = await prisma.kanbanColumn.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(columns);
  } catch (error) {
    console.error("PATCH /api/projects/[id]/kanban/columns/reorder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
