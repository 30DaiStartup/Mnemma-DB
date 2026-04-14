import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKanbanSubtaskSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    const subtasks = await prisma.kanbanSubtask.findMany({
      where: { itemId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error("GET /api/kanban-items/[id]/subtasks error:", error);
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
    const { id: itemId } = await params;

    const body = await request.json();
    const result = createKanbanSubtaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const subtask = await prisma.kanbanSubtask.create({
      data: {
        itemId,
        title: result.data.title,
        sortOrder: result.data.sortOrder,
      },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error("POST /api/kanban-items/[id]/subtasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
