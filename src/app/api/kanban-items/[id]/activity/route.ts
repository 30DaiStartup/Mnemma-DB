import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    const activities = await prisma.kanbanActivity.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
    });

    const parsed = activities.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/kanban-items/[id]/activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
