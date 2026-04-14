import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPersonalIdeaSchema } from "@/lib/validators";
import { getCurrentMemberId } from "@/lib/current-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId") || getCurrentMemberId();

    const ideas = await prisma.personalIdea.findMany({
      where: { ownerId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("GET /api/personal-ideas error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal ideas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createPersonalIdeaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const ownerId = getCurrentMemberId();

    const idea = await prisma.personalIdea.create({
      data: {
        ...result.data,
        ownerId,
      },
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error("POST /api/personal-ideas error:", error);
    return NextResponse.json(
      { error: "Failed to create personal idea" },
      { status: 500 }
    );
  }
}
