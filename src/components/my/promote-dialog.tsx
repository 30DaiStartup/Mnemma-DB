"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/use-teams";
import type { PersonalIdeaData } from "@/types";

interface PromoteDialogProps {
  idea: PersonalIdeaData;
  onPromote: (teamId: string) => Promise<void>;
  onClose: () => void;
}

export function PromoteDialog({ idea, onPromote, onClose }: PromoteDialogProps) {
  const { teams, isLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [promoting, setPromoting] = useState(false);

  async function handlePromote() {
    if (!selectedTeamId) return;
    setPromoting(true);
    try {
      await onPromote(selectedTeamId);
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-1 text-base font-semibold">Promote to Project</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Promote &ldquo;{idea.title}&rdquo; to a project in a team backlog.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium">
            Select Team
          </label>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading teams...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selectedTeamId === team.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {team.members.length} members
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handlePromote}
            disabled={!selectedTeamId || promoting}
          >
            {promoting ? "Promoting..." : "Promote"}
          </Button>
        </div>
      </div>
    </div>
  );
}
