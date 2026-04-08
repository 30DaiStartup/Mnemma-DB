import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateKanbanItemSchema } from "@/lib/validators";

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

    const item = await prisma.kanbanItem.update({
      where: { id },
      data: result.data,
    });

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
