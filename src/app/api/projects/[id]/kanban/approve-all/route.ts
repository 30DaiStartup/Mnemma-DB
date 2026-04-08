import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const result = await prisma.kanbanItem.updateMany({
      where: {
        projectId: id,
        approved: false,
        dismissed: false,
      },
      data: {
        approved: true,
        isNew: false,
      },
    });

    return NextResponse.json({ approved: result.count });
  } catch (error) {
    console.error("POST /api/projects/[id]/kanban/approve-all error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
