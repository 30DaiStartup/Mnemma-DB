import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateKanbanItemSchema } from "@/lib/validators";

// Fields we track in activity log
const TRACKED_FIELDS: Record<string, string> = {
  column: "status_change",
  assigneeId: "assignment",
  priority: "priority",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.kanbanItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Kanban item not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateKanbanItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Handle dueDate conversion
    const updateData: Record<string, unknown> = { ...result.data };
    if ("dueDate" in updateData) {
      updateData.dueDate = updateData.dueDate
        ? new Date(updateData.dueDate as string)
        : null;
    }

    const item = await prisma.kanbanItem.update({
      where: { id },
      data: updateData,
    });

    // Create activity log entries for tracked field changes
    const activityEntries = [];
    for (const [field, activityType] of Object.entries(TRACKED_FIELDS)) {
      if (
        field in result.data &&
        (result.data as Record<string, unknown>)[field] !==
          (existing as Record<string, unknown>)[field]
      ) {
        activityEntries.push({
          itemId: id,
          type: activityType,
          content: "",
          metadata: JSON.stringify({
            from: String((existing as Record<string, unknown>)[field] ?? ""),
            to: String((result.data as Record<string, unknown>)[field] ?? ""),
          }),
        });
      }
    }

    if (activityEntries.length > 0) {
      await prisma.kanbanActivity.createMany({ data: activityEntries });
    }

    return NextResponse.json({
      ...item,
      metadata: JSON.parse(item.metadata),
    });
  } catch (error) {
    console.error("PATCH /api/kanban-items/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.kanbanItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Kanban item not found" },
        { status: 404 }
      );
    }

    await prisma.kanbanItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/kanban-items/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
