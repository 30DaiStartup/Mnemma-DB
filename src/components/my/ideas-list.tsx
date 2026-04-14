"use client";

import { useState } from "react";
import { Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { IdeaItem } from "@/components/my/idea-item";
import { PromoteDialog } from "@/components/my/promote-dialog";
import { usePersonalIdeas } from "@/hooks/use-personal-ideas";
import type { PersonalIdeaData } from "@/types";

export function IdeasList() {
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea, promoteIdea } =
    usePersonalIdeas();
  const [newTitle, setNewTitle] = useState("");
  const [promoting, setPromoting] = useState<PersonalIdeaData | null>(null);

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    await createIdea({ title });
    setNewTitle("");
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  }

  const activeIdeas = ideas.filter(
    (i) => i.status !== "promoted" && i.status !== "discarded"
  );
  const promotedIdeas = ideas.filter((i) => i.status === "promoted");

  return (
    <div className="space-y-4">
      {/* Inline create */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new idea..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!newTitle.trim()}
        >
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Active ideas */}
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : activeIdeas.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No ideas yet"
          description="Add your first idea above to get started."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {activeIdeas.map((idea) => (
            <IdeaItem
              key={idea.id}
              idea={idea}
              onUpdate={updateIdea}
              onDelete={deleteIdea}
              onPromote={() => setPromoting(idea)}
            />
          ))}
        </div>
      )}

      {/* Promoted ideas */}
      {promotedIdeas.length > 0 && (
        <div className="pt-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Promoted to Projects
          </h3>
          <div className="flex flex-col gap-2 opacity-60">
            {promotedIdeas.map((idea) => (
              <IdeaItem
                key={idea.id}
                idea={idea}
                onUpdate={updateIdea}
                onDelete={deleteIdea}
                onPromote={() => {}}
                disabled
              />
            ))}
          </div>
        </div>
      )}

      {/* Promote dialog */}
      {promoting && (
        <PromoteDialog
          idea={promoting}
          onPromote={async (teamId) => {
            await promoteIdea(promoting.id, teamId);
            setPromoting(null);
          }}
          onClose={() => setPromoting(null)}
        />
      )}
    </div>
  );
}
