import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePersonalIdeaSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updatePersonalIdeaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.personalIdea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    const idea = await prisma.personalIdea.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error("PATCH /api/personal-ideas/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update idea" },
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

    const existing = await prisma.personalIdea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    await prisma.personalIdea.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/personal-ideas/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    );
  }
}
