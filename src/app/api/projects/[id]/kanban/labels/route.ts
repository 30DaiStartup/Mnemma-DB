import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKanbanLabelSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const labels = await prisma.kanbanLabel.findMany({
      where: { projectId: id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error("GET /api/projects/[id]/kanban/labels error:", error);
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
    const { id } = await params;

    const body = await request.json();
    const result = createKanbanLabelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const label = await prisma.kanbanLabel.create({
      data: {
        projectId: id,
        name: result.data.name,
        color: result.data.color ?? "#3b82f6",
      },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/kanban/labels error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
