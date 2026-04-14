import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bulkUpdateKanbanItemsSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const result = bulkUpdateKanbanItemsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { ids, update } = result.data;

    await prisma.kanbanItem.updateMany({
      where: {
        id: { in: ids },
        projectId: id,
      },
      data: update,
    });

    return NextResponse.json({ success: true, updatedCount: ids.length });
  } catch (error) {
    console.error("PATCH /api/projects/[id]/kanban/bulk error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
