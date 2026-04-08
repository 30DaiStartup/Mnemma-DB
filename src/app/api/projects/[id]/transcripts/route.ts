import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTranscriptSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const transcripts = await prisma.transcriptSummary.findMany({
      where: { projectId: id },
      orderBy: { date: "desc" },
    });

    const parsed = transcripts.map((t: { participants: string; actionItems: string; [key: string]: unknown }) => ({
      ...t,
      participants: JSON.parse(t.participants),
      actionItems: JSON.parse(t.actionItems),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/projects/[id]/transcripts error:", error);
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

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = createTranscriptSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { date, ...rest } = result.data;

    const transcript = await prisma.transcriptSummary.create({
      data: {
        ...rest,
        date: new Date(date),
        projectId: id,
      },
    });

    return NextResponse.json(
      {
        ...transcript,
        participants: JSON.parse(transcript.participants),
        actionItems: JSON.parse(transcript.actionItems),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects/[id]/transcripts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
