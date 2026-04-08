"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { useKanban } from "@/hooks/use-kanban";
import { DEFAULT_KANBAN_COLUMNS } from "@/types";
import type { KanbanItemData } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanBoardProps {
  projectId: string;
  initialItems: KanbanItemData[];
  teamMembers: TeamMember[];
}

export function KanbanBoard({
  projectId,
  initialItems,
  teamMembers,
}: KanbanBoardProps) {
  const {
    items,
    moveItem,
    reorderItems,
    approveItem,
    dismissItem,
    approveAll,
  } = useKanban(projectId);

  // Use SWR items if loaded, otherwise initial
  const kanbanItems = items.length > 0 ? items : initialItems;
  const activeItems = kanbanItems.filter((item) => !item.dismissed);
  const hasUnapproved = activeItems.some(
    (item) => item.isNew && !item.approved
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getColumnItems = useCallback(
    (column: string) =>
      activeItems
        .filter((item) => item.column === column)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [activeItems]
  );

  function findColumnForItem(itemId: string): string | undefined {
    return activeItems.find((item) => item.id === itemId)?.column;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    // Handle cross-column drags during the drag (for visual feedback)
    // Actual persistence happens in handleDragEnd
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnForItem(activeItemId);

    // Determine target column: if dropped over a column droppable or another item
    let overColumn: string | undefined;
    if (DEFAULT_KANBAN_COLUMNS.includes(overId)) {
      overColumn = overId;
    } else {
      overColumn = findColumnForItem(overId);
    }

    if (!activeColumn || !overColumn) return;

    if (activeColumn === overColumn) {
      // Same column reorder
      const columnItems = getColumnItems(activeColumn);
      const oldIndex = columnItems.findIndex((i) => i.id === activeItemId);
      const newIndex = columnItems.findIndex((i) => i.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnItems, oldIndex, newIndex);
        const updates = reordered.map((item, index) => ({
          id: item.id,
          column: activeColumn,
          sortOrder: index,
        }));
        reorderItems(updates);
      }
    } else {
      // Cross-column move
      const targetItems = getColumnItems(overColumn);
      const overIndex = targetItems.findIndex((i) => i.id === overId);
      const sortOrder =
        overIndex >= 0 ? overIndex : targetItems.length;

      moveItem(activeItemId, overColumn, sortOrder);
    }
  }

  const activeItem = activeId
    ? activeItems.find((item) => item.id === activeId)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      {hasUnapproved && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            New items from transcripts need approval
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => approveAll()}
            className="gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Approve All
          </Button>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-w-0">
          {DEFAULT_KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              id={column}
              title={column}
              items={getColumnItems(column)}
              teamMembers={teamMembers}
              onApprove={approveItem}
              onDismiss={dismissItem}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard item={activeItem} teamMembers={teamMembers} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
