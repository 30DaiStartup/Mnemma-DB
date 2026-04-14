import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const { labelId } = await request.json();

    if (!labelId) {
      return NextResponse.json(
        { error: "labelId is required" },
        { status: 400 }
      );
    }

    const link = await prisma.kanbanItemLabel.create({
      data: { itemId, labelId },
      include: { label: true },
    });

    return NextResponse.json(link.label, { status: 201 });
  } catch (error) {
    console.error("POST /api/kanban-items/[id]/labels error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
