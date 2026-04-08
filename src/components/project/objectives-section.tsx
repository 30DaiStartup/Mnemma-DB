"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, CircleDot, CheckCircle2 } from "lucide-react";
import type { ObjectiveData, ObjectiveStatus } from "@/types";

const STATUS_CYCLE: ObjectiveStatus[] = [
  "not-started",
  "in-progress",
  "completed",
];

const STATUS_CONFIG: Record<
  ObjectiveStatus,
  {
    icon: typeof Circle;
    label: string;
    badgeClass: string;
    iconClass: string;
  }
> = {
  "not-started": {
    icon: Circle,
    label: "Not Started",
    badgeClass: "bg-muted text-muted-foreground border-border",
    iconClass: "text-muted-foreground",
  },
  "in-progress": {
    icon: CircleDot,
    label: "In Progress",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    iconClass: "text-blue-400",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    iconClass: "text-emerald-400",
  },
};

interface ObjectivesSectionProps {
  objectives: ObjectiveData[];
  projectId: string;
}

export function ObjectivesSection({
  objectives: initialObjectives,
  projectId,
}: ObjectivesSectionProps) {
  const [objectives, setObjectives] = useState(initialObjectives);

  async function cycleStatus(objectiveId: string) {
    const objective = objectives.find((o) => o.id === objectiveId);
    if (!objective) return;

    const currentIndex = STATUS_CYCLE.indexOf(
      objective.status as ObjectiveStatus
    );
    const nextStatus =
      STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    const previous = objectives;
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === objectiveId ? { ...o, status: nextStatus } : o
      )
    );

    try {
      const res = await fetch(`/api/projects/${projectId}/objectives`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: objectiveId, status: nextStatus }),
      });
      if (!res.ok) setObjectives(previous);
    } catch {
      setObjectives(previous);
    }
  }

  if (objectives.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No objectives defined yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {objectives
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((objective) => {
          const status = objective.status as ObjectiveStatus;
          const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["not-started"];
          const Icon = config.icon;

          return (
            <div
              key={objective.id}
              className="flex items-start gap-3 py-3 px-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
            >
              <button
                onClick={() => cycleStatus(objective.id)}
                className={`mt-0.5 shrink-0 transition-colors hover:opacity-80 ${config.iconClass}`}
                title={`Click to change status (current: ${config.label})`}
              >
                <Icon className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      status === "completed"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {objective.title}
                  </span>
                  <button onClick={() => cycleStatus(objective.id)}>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 px-1.5 cursor-pointer ${config.badgeClass}`}
                    >
                      {config.label}
                    </Badge>
                  </button>
                </div>
                {objective.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {objective.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
