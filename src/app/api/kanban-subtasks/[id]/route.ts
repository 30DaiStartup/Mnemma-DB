import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateKanbanSubtaskSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const result = updateKanbanSubtaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const subtask = await prisma.kanbanSubtask.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(subtask);
  } catch (error) {
    console.error("PATCH /api/kanban-subtasks/[id] error:", error);
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

    await prisma.kanbanSubtask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/kanban-subtasks/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
