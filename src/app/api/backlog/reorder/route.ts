import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reorderBacklogSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reorderBacklogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = result.data;

    await prisma.$transaction(
      items.map((item) =>
        prisma.project.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/backlog/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder backlog" },
      { status: 500 }
    );
  }
}
