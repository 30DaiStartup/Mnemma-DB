"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PhaseDefinition } from "@/types";

interface PhaseTrackerProps {
  phases: PhaseDefinition[];
  currentPhase: string;
  projectId: string;
}

export function PhaseTracker({
  phases,
  currentPhase,
  projectId,
}: PhaseTrackerProps) {
  const [activePhase, setActivePhase] = useState(currentPhase);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentIndex = phases.findIndex((p) => p.name === activePhase);

  async function handlePhaseClick(phaseName: string) {
    if (isUpdating || phaseName === activePhase) return;

    setIsUpdating(true);
    const previousPhase = activePhase;
    setActivePhase(phaseName);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: phaseName }),
      });
      if (!res.ok) {
        setActivePhase(previousPhase);
      }
    } catch {
      setActivePhase(previousPhase);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max">
        {phases.map((phase, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={phase.name} className="flex items-center">
              <button
                onClick={() => handlePhaseClick(phase.name)}
                disabled={isUpdating}
                className="flex items-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
                title={phase.description}
              >
                {/* Circle indicator */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : isPast
                        ? "bg-primary/20 border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground/30"
                  } ${!isUpdating ? "group-hover:border-primary group-hover:text-primary" : ""}`}
                >
                  {isPast ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                {/* Phase name */}
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? "text-foreground"
                      : isPast
                        ? "text-foreground/70"
                        : "text-muted-foreground/50"
                  } ${!isUpdating ? "group-hover:text-foreground" : ""}`}
                >
                  {phase.name}
                </span>
              </button>
              {/* Connector line */}
              {index < phases.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-colors ${
                    isPast ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
