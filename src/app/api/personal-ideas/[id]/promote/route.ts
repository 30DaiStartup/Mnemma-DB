import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promoteIdeaSchema } from "@/lib/validators";
import { getDefaultPhases } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = promoteIdeaSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const idea = await prisma.personalIdea.findUnique({ where: { id } });
    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    if (idea.status === "promoted") {
      return NextResponse.json(
        { error: "Idea already promoted" },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: result.data.teamId },
    });
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Create project from idea
    const phases = getDefaultPhases("technical");
    const project = await prisma.project.create({
      data: {
        name: idea.title,
        description: idea.description,
        status: "backlog",
        teamId: team.id,
        phaseConfig: JSON.stringify(phases),
      },
    });

    // Mark idea as promoted
    await prisma.personalIdea.update({
      where: { id },
      data: {
        status: "promoted",
        promotedToProjectId: project.id,
      },
    });

    return NextResponse.json({ project, idea: { id, status: "promoted" } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/personal-ideas/[id]/promote error:", error);
    return NextResponse.json(
      { error: "Failed to promote idea" },
      { status: 500 }
    );
  }
}
