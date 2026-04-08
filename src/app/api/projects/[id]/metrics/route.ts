import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMetricSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const metrics = await prisma.metric.findMany({
      where: { projectId: id },
    });

    const parsed = metrics.map((metric: { history: string; [key: string]: unknown }) => ({
      ...metric,
      history: JSON.parse(metric.history),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/projects/[id]/metrics error:", error);
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
    const result = createMetricSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const metric = await prisma.metric.upsert({
      where: {
        projectId_name: {
          projectId: id,
          name: result.data.name,
        },
      },
      update: {
        value: result.data.value,
        unit: result.data.unit,
        category: result.data.category,
        trend: result.data.trend,
        history: result.data.history,
      },
      create: {
        ...result.data,
        projectId: id,
      },
    });

    return NextResponse.json(
      { ...metric, history: JSON.parse(metric.history) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects/[id]/metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
