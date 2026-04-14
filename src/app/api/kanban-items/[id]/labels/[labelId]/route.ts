import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  try {
    const { id: itemId, labelId } = await params;

    await prisma.kanbanItemLabel.deleteMany({
      where: { itemId, labelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/kanban-items/[id]/labels/[labelId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
