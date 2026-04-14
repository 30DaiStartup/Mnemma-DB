"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Tags, X } from "lucide-react";
import { useKanbanLabels } from "@/hooks/use-kanban-labels";
import { mutate as globalMutate } from "swr";
import type { KanbanLabelData } from "@/types";

const LABEL_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

interface KanbanLabelPickerProps {
  projectId: string;
  itemId: string;
  currentLabels: KanbanLabelData[];
}

export function KanbanLabelPicker({
  projectId,
  itemId,
  currentLabels,
}: KanbanLabelPickerProps) {
  const { labels, addLabel, assignLabel, removeLabel } =
    useKanbanLabels(projectId);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);

  const currentLabelIds = new Set(currentLabels.map((l) => l.id));

  async function handleToggle(labelId: string) {
    if (currentLabelIds.has(labelId)) {
      await removeLabel(itemId, labelId);
    } else {
      await assignLabel(itemId, labelId);
    }
    // Revalidate kanban items to update card display
    globalMutate(`/api/projects/${projectId}/kanban`);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await addLabel(name, selectedColor);
    setNewName("");
    setIsCreating(false);
  }

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors cursor-pointer">
        <Tags className="w-3.5 h-3.5" />
        {currentLabels.length > 0 ? (
          <span className="flex items-center gap-1">
            {currentLabels.slice(0, 3).map((l) => (
              <span
                key={l.id}
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: l.color }}
              />
            ))}
            {currentLabels.length > 3 && (
              <span className="text-muted-foreground">
                +{currentLabels.length - 3}
              </span>
            )}
          </span>
        ) : (
          "Add labels"
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Labels</p>

          {labels.length === 0 && !isCreating && (
            <p className="text-xs text-muted-foreground py-2">
              No labels yet. Create one below.
            </p>
          )}

          {/* Label list */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {labels.map((label) => (
              <label
                key={label.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={currentLabelIds.has(label.id)}
                  onCheckedChange={() => handleToggle(label.id)}
                />
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm truncate">{label.name}</span>
              </label>
            ))}
          </div>

          {/* Create new label */}
          {isCreating ? (
            <div className="space-y-2 pt-1 border-t border-border/50">
              <Input
                placeholder="Label name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                className="h-7 text-xs"
                autoFocus
              />
              <div className="flex gap-1">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 rounded-full transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleCreate}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setIsCreating(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
            >
              <Plus className="w-3.5 h-3.5" />
              Create label
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
