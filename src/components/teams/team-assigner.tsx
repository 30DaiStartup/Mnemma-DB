"use client";

import { useState, useCallback, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, AlertCircle, Users } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface TeamAssignerProps {
  projectId: string;
  teams: { id: string; slug: string; name: string }[];
  initialTeamId: string | null;
}

export function TeamAssigner({
  projectId,
  teams,
  initialTeamId,
}: TeamAssignerProps) {
  const [teamId, setTeamId] = useState(initialTeamId || "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(
    async (newTeamId: string) => {
      setStatus("saving");
      if (savedTimer.current) clearTimeout(savedTimer.current);

      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: newTeamId || null }),
        });

        if (!res.ok) throw new Error("Save failed");

        setStatus("saved");
        savedTimer.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
        savedTimer.current = setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [projectId]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Team</h3>
        </div>
        {status === "saving" && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        )}
        {status === "saved" && (
          <Check className="size-3.5 text-green-500" />
        )}
        {status === "error" && (
          <AlertCircle className="size-3.5 text-destructive" />
        )}
      </div>

      <Select
        value={teamId}
        onValueChange={(value) => {
          const v = value ?? "";
          setTeamId(v);
          save(v);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No team assigned" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        Assign this project to a team to include it in their backlog.
      </p>
    </div>
  );
}
