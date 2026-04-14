"use client";

import { Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PersonalIdeaData } from "@/types";

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  critical:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

interface IdeaItemProps {
  idea: PersonalIdeaData;
  onUpdate: (id: string, updates: Partial<PersonalIdeaData>) => void;
  onDelete: (id: string) => void;
  onPromote: () => void;
  disabled?: boolean;
}

export function IdeaItem({
  idea,
  onUpdate,
  onDelete,
  onPromote,
  disabled,
}: IdeaItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{idea.title}</p>
        {idea.description && (
          <p className="truncate text-xs text-muted-foreground">
            {idea.description}
          </p>
        )}
      </div>

      <Badge
        variant="outline"
        className={`shrink-0 text-xs capitalize ${priorityColors[idea.priority] || ""}`}
      >
        {idea.priority}
      </Badge>

      <Badge variant="outline" className="shrink-0 text-xs capitalize">
        {idea.status}
      </Badge>

      {!disabled && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Promote to project"
            onClick={onPromote}
          >
            <ArrowUpRight className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            title="Delete idea"
            onClick={() => onDelete(idea.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
