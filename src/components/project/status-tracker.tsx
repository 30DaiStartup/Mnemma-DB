"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil, Check } from "lucide-react";
import type { HealthStatus } from "@/types";

const HEALTH_CONFIG: Record<
  HealthStatus,
  { label: string; className: string }
> = {
  "on-track": {
    label: "On Track",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/15 text-red-500 border-red-500/30",
  },
};

interface StatusTrackerProps {
  health: HealthStatus;
  nextStep: string;
  projectId: string;
}

export function StatusTracker({
  health: initialHealth,
  nextStep: initialNextStep,
  projectId,
}: StatusTrackerProps) {
  const [health, setHealth] = useState<HealthStatus>(initialHealth);
  const [nextStep, setNextStep] = useState(initialNextStep);
  const [isEditingNextStep, setIsEditingNextStep] = useState(false);
  const [editValue, setEditValue] = useState(initialNextStep);

  async function updateHealth(newHealth: HealthStatus) {
    const previous = health;
    setHealth(newHealth);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ health: newHealth }),
      });
      if (!res.ok) setHealth(previous);
    } catch {
      setHealth(previous);
    }
  }

  async function saveNextStep() {
    const previous = nextStep;
    setNextStep(editValue);
    setIsEditingNextStep(false);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStep: editValue }),
      });
      if (!res.ok) setNextStep(previous);
    } catch {
      setNextStep(previous);
    }
  }

  const config = HEALTH_CONFIG[health];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Badge
              variant="outline"
              className={`${config.className} cursor-pointer gap-1 pr-1.5`}
            >
              {config.label}
              <ChevronDown className="w-3 h-3" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(HEALTH_CONFIG) as HealthStatus[]).map((key) => (
              <DropdownMenuItem key={key} onClick={() => updateHealth(key)}>
                <span
                  className={`w-2 h-2 rounded-full ${
                    key === "on-track"
                      ? "bg-emerald-500"
                      : key === "at-risk"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
                {HEALTH_CONFIG[key].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Next step */}
      <div className="flex items-start gap-2">
        <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
          Next:
        </span>
        {isEditingNextStep ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNextStep();
                if (e.key === "Escape") {
                  setEditValue(nextStep);
                  setIsEditingNextStep(false);
                }
              }}
              className="flex-1 bg-transparent border-b border-primary text-sm outline-none"
              autoFocus
            />
            <button
              onClick={saveNextStep}
              className="p-0.5 hover:text-primary transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditValue(nextStep);
              setIsEditingNextStep(true);
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors text-left group"
          >
            <span>{nextStep || "Set next step..."}</span>
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
