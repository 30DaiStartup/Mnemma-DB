import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestTranscriptSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = ingestTranscriptSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, title, date, summary, actionItems, sourceFile, participants } =
      result.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const transcript = await prisma.transcriptSummary.create({
      data: {
        projectId,
        title,
        date: new Date(date),
        summary,
        actionItems: JSON.stringify(actionItems),
        sourceFile,
        participants: JSON.stringify(participants),
      },
    });

    const kanbanItems = await Promise.all(
      actionItems.map((item, index) =>
        prisma.kanbanItem.create({
          data: {
            projectId,
            title: item,
            column: "To Do",
            sortOrder: index,
            source: "transcript",
            sourceId: transcript.id,
            isNew: true,
            approved: false,
          },
        })
      )
    );

    return NextResponse.json(
      {
        transcript: {
          ...transcript,
          participants: JSON.parse(transcript.participants),
          actionItems: JSON.parse(transcript.actionItems),
        },
        kanbanItems: kanbanItems.map((ki: { metadata: string; [key: string]: unknown }) => ({
          ...ki,
          metadata: JSON.parse(ki.metadata),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ingest/transcript error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
