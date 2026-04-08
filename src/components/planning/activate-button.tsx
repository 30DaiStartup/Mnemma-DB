"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Rocket, Loader2 } from "lucide-react";
import type { PhaseDefinition } from "@/types";

interface ActivateButtonProps {
  projectId: string;
  projectName: string;
  teamCount: number;
  objectiveCount: number;
  phases: PhaseDefinition[];
}

export function ActivateButton({
  projectId,
  projectName,
  teamCount,
  objectiveCount,
  phases,
}: ActivateButtonProps) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [open, setOpen] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const firstPhase = phases.length > 0 ? phases[0].name : "";
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          phase: firstPhase,
        }),
      });

      if (!res.ok) throw new Error("Activation failed");

      setOpen(false);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error("Failed to activate project:", err);
      setActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full gap-2 h-11 text-sm font-medium" />
        }
      >
        <Rocket className="size-4" />
        Activate Project
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to activate this project? This will move
            it from the backlog to active status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Project</span>
            <span className="font-medium">{projectName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Team members</span>
            <span className="font-medium">{teamCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Objectives</span>
            <span className="font-medium">{objectiveCount}</span>
          </div>
          {phases.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Starting phase</span>
              <span className="font-medium">{phases[0].name}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" size="sm" />}
          >
            Cancel
          </DialogClose>
          <Button
            size="sm"
            onClick={handleActivate}
            disabled={activating}
          >
            {activating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Activating...
              </>
            ) : (
              "Confirm Activation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
