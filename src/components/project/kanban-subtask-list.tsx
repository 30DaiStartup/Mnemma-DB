"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, ListChecks } from "lucide-react";
import { useKanbanSubtasks } from "@/hooks/use-kanban-subtasks";

interface KanbanSubtaskListProps {
  itemId: string;
}

export function KanbanSubtaskList({ itemId }: KanbanSubtaskListProps) {
  const { subtasks, addSubtask, toggleSubtask, deleteSubtask } =
    useKanbanSubtasks(itemId);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const completed = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function handleAdd() {
    const title = newTitle.trim();
    if (title) {
      addSubtask(title);
      setNewTitle("");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <ListChecks className="w-3.5 h-3.5" />
          Subtasks
          {total > 0 && (
            <span className="text-[10px]">
              ({completed}/{total})
            </span>
          )}
        </label>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group px-1 py-1 rounded hover:bg-muted/50"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => toggleSubtask(subtask.id)}
            />
            <span
              className={`text-sm flex-1 ${
                subtask.completed
                  ? "line-through text-muted-foreground"
                  : ""
              }`}
            >
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
              onClick={() => deleteSubtask(subtask.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add subtask */}
      {isAdding ? (
        <div className="flex gap-1.5">
          <Input
            placeholder="Subtask title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewTitle("");
              }
            }}
            className="h-7 text-xs"
            autoFocus
          />
          <Button size="sm" className="h-7 px-2" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => {
              setIsAdding(false);
              setNewTitle("");
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
}
