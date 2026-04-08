"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { ObjectiveData } from "@/types";

interface ObjectiveEditorProps {
  projectId: string;
  initialObjectives: ObjectiveData[];
}

export function ObjectiveEditor({
  projectId,
  initialObjectives,
}: ObjectiveEditorProps) {
  const [objectives, setObjectives] =
    useState<ObjectiveData[]>(initialObjectives);
  const [saving, setSaving] = useState<string | null>(null);

  const addObjective = useCallback(async () => {
    try {
      const sortOrder =
        objectives.length > 0
          ? Math.max(...objectives.map((o) => o.sortOrder)) + 1
          : 0;

      const res = await fetch(`/api/projects/${projectId}/objectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New objective",
          description: "",
          sortOrder,
        }),
      });

      if (!res.ok) throw new Error("Failed to create objective");

      const created: ObjectiveData = await res.json();
      setObjectives((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to add objective:", err);
    }
  }, [projectId, objectives]);

  const updateObjective = useCallback(
    async (id: string, fields: Partial<ObjectiveData>) => {
      setSaving(id);
      try {
        const res = await fetch(`/api/projects/${projectId}/objectives`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...fields }),
        });

        if (!res.ok) throw new Error("Failed to update objective");

        const updated: ObjectiveData = await res.json();
        setObjectives((prev) =>
          prev.map((o) => (o.id === id ? updated : o))
        );
      } catch (err) {
        console.error("Failed to update objective:", err);
      } finally {
        setSaving(null);
      }
    },
    [projectId]
  );

  const deleteObjective = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/objectives`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("Failed to delete objective");

        setObjectives((prev) => prev.filter((o) => o.id !== id));
      } catch (err) {
        console.error("Failed to delete objective:", err);
      }
    },
    [projectId]
  );

  const moveObjective = useCallback(
    async (id: string, direction: "up" | "down") => {
      const sorted = [...objectives].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      const index = sorted.findIndex((o) => o.id === id);
      if (index < 0) return;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return;

      const current = sorted[index];
      const swap = sorted[swapIndex];

      // Swap sort orders
      const newObjectives = sorted.map((o) => {
        if (o.id === current.id)
          return { ...o, sortOrder: swap.sortOrder };
        if (o.id === swap.id)
          return { ...o, sortOrder: current.sortOrder };
        return o;
      });

      setObjectives(newObjectives);

      // Persist both changes
      await Promise.all([
        updateObjective(current.id, { sortOrder: swap.sortOrder }),
        updateObjective(swap.id, { sortOrder: current.sortOrder }),
      ]);
    },
    [objectives, updateObjective]
  );

  const sorted = [...objectives].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Objectives</h2>
        <Button variant="ghost" size="sm" onClick={addObjective}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {sorted.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No objectives yet. Add one to get started.
        </p>
      )}

      <div className="space-y-2">
        {sorted.map((objective, index) => (
          <ObjectiveRow
            key={objective.id}
            objective={objective}
            isSaving={saving === objective.id}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
            onUpdate={(fields) => updateObjective(objective.id, fields)}
            onDelete={() => deleteObjective(objective.id)}
            onMove={(dir) => moveObjective(objective.id, dir)}
          />
        ))}
      </div>
    </div>
  );
}

interface ObjectiveRowProps {
  objective: ObjectiveData;
  isSaving: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (fields: Partial<ObjectiveData>) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

function ObjectiveRow({
  objective,
  isSaving,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
}: ObjectiveRowProps) {
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description);

  return (
    <div className="group flex items-start gap-2 rounded-lg border bg-card p-2.5 transition-colors hover:bg-accent/30">
      <div className="flex flex-col items-center gap-0.5 pt-1.5">
        <GripVertical className="size-3.5 text-muted-foreground/50" />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onMove("up")}
          disabled={isFirst}
          className="size-5"
        >
          <ChevronUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onMove("down")}
          disabled={isLast}
          className="size-5"
        >
          <ChevronDown className="size-3" />
        </Button>
      </div>

      <div className="flex-1 space-y-1.5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== objective.title) onUpdate({ title });
          }}
          placeholder="Objective title"
          className="h-7 text-sm font-medium"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== objective.description)
              onUpdate({ description });
          }}
          placeholder="Brief description..."
          className="h-7 text-xs text-muted-foreground"
        />
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDelete}
        className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}
