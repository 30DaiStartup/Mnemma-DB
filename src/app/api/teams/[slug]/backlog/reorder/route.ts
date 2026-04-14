import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reorderTeamBacklogSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const team = await prisma.team.findUnique({ where: { slug } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = reorderTeamBacklogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      result.data.items.map((item) =>
        prisma.project.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/teams/[slug]/backlog/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder team backlog" },
      { status: 500 }
    );
  }
}
