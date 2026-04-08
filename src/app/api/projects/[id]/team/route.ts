import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teamAssignmentSchema } from "@/lib/validators";

type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const assignments = await prisma.teamAssignment.findMany({
      where: { projectId: id },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("GET /api/projects/[id]/team error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team assignments" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = teamAssignmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const { members, leadId } = result.data;

    const assignments = await prisma.$transaction(async (tx: TransactionClient) => {
      // Delete existing assignments
      await tx.teamAssignment.deleteMany({
        where: { projectId: id },
      });

      // Create new assignments
      const created = await Promise.all(
        members.map((member) =>
          tx.teamAssignment.create({
            data: {
              projectId: id,
              memberId: member.memberId,
              role: member.role,
            },
          })
        )
      );

      // Update project leadId if provided
      if (leadId !== undefined) {
        await tx.project.update({
          where: { id },
          data: { leadId },
        });
      }

      return created;
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("PUT /api/projects/[id]/team error:", error);
    return NextResponse.json(
      { error: "Failed to update team assignments" },
      { status: 500 }
    );
  }
}
