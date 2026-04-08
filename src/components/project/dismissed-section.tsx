"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { KanbanItemData } from "@/types";

interface DismissedSectionProps {
  items: KanbanItemData[];
  onRestore: (id: string) => void;
}

export function DismissedSection({ items, onRestore }: DismissedSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dismissedItems = items.filter((item) => item.dismissed);

  if (dismissedItems.length === 0) return null;

  return (
    <div className="border border-border/50 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium">
          Dismissed Items ({dismissedItems.length})
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 space-y-2">
          {dismissedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 border border-border/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-muted-foreground truncate">
                  {item.title}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 shrink-0"
                >
                  {item.column}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(item.id)}
                className="gap-1 text-xs shrink-0 h-7"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
