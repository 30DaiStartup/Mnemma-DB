import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKanbanCommentSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    const body = await request.json();
    const result = createKanbanCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const activity = await prisma.kanbanActivity.create({
      data: {
        itemId,
        type: "comment",
        actorId: result.data.actorId ?? "",
        content: result.data.content,
        metadata: "{}",
      },
    });

    return NextResponse.json(
      { ...activity, metadata: {} },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/kanban-items/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
