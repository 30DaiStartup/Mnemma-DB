import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestMetricsSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = ingestMetricsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, metrics } = result.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const now = new Date().toISOString().split("T")[0];

    const updatedMetrics = await Promise.all(
      metrics.map(async (m) => {
        const existing = await prisma.metric.findUnique({
          where: {
            projectId_name: {
              projectId,
              name: m.name,
            },
          },
        });

        let history: { date: string; value: number }[] = [];
        let trend: "up" | "down" | "stable" = "stable";

        if (existing) {
          history = JSON.parse(existing.history);
          if (existing.value < m.value) trend = "up";
          else if (existing.value > m.value) trend = "down";
        }

        history.push({ date: now, value: m.value });

        return prisma.metric.upsert({
          where: {
            projectId_name: {
              projectId,
              name: m.name,
            },
          },
          update: {
            value: m.value,
            unit: m.unit,
            category: m.category,
            trend,
            history: JSON.stringify(history),
          },
          create: {
            projectId,
            name: m.name,
            value: m.value,
            unit: m.unit,
            category: m.category,
            trend,
            history: JSON.stringify([{ date: now, value: m.value }]),
          },
        });
      })
    );

    return NextResponse.json(
      updatedMetrics.map((metric: { history: string; [key: string]: unknown }) => ({
        ...metric,
        history: JSON.parse(metric.history),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/ingest/metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
