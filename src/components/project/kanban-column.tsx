"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import type { KanbanItemData } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanColumnProps {
  id: string;
  title: string;
  items: KanbanItemData[];
  teamMembers: TeamMember[];
  onApprove?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function KanbanColumn({
  id,
  title,
  items,
  teamMembers,
  onApprove,
  onDismiss,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`flex flex-col rounded-lg bg-muted/30 border border-border/50 min-w-[260px] w-[260px] ${
        isOver ? "ring-2 ring-primary/30" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[100px]"
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              teamMembers={teamMembers}
              onApprove={onApprove}
              onDismiss={onDismiss}
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            No items
          </div>
        )}
      </div>
    </div>
  );
}
