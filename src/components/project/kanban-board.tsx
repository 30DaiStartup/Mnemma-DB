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
import { Input } from "@/components/ui/input";
import { CheckCheck, Plus, X } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { KanbanItemDetail } from "./kanban-item-detail";
import { useKanban } from "@/hooks/use-kanban";
import { useKanbanColumns } from "@/hooks/use-kanban-columns";
import type { KanbanItemData, KanbanColumnData, KanbanFilters } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanBoardProps {
  projectId: string;
  initialItems: KanbanItemData[];
  teamMembers: TeamMember[];
  filters?: KanbanFilters;
}

function applyFilters(items: KanbanItemData[], filters?: KanbanFilters): KanbanItemData[] {
  if (!filters) return items;

  return items.filter((item) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(item.assigneeId))
      return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(item.priority))
      return false;
    if (filters.labelIds.length > 0) {
      const itemLabelIds = item.labels?.map((l) => l.id) ?? [];
      if (!filters.labelIds.some((id) => itemLabelIds.includes(id))) return false;
    }
    if (filters.dueDateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueDate = item.dueDate ? new Date(item.dueDate) : null;
      switch (filters.dueDateFilter) {
        case "overdue":
          if (!dueDate || dueDate >= today || item.column === "Done") return false;
          break;
        case "today":
          if (!dueDate || dueDate.toDateString() !== today.toDateString()) return false;
          break;
        case "this-week": {
          if (!dueDate) return false;
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (dueDate < today || dueDate > weekEnd) return false;
          break;
        }
        case "no-date":
          if (dueDate) return false;
          break;
      }
    }
    return true;
  });
}

export function KanbanBoard({
  projectId,
  initialItems,
  teamMembers,
  filters,
}: KanbanBoardProps) {
  const {
    items,
    moveItem,
    reorderItems,
    approveItem,
    dismissItem,
    approveAll,
    addItem,
    updateItem,
    deleteItem,
  } = useKanban(projectId);

  const {
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
  } = useKanbanColumns(projectId);

  // Use SWR items if loaded, otherwise initial
  const kanbanItems = items.length > 0 ? items : initialItems;
  const activeItems = kanbanItems.filter((item) => !item.dismissed);
  const filteredItems = applyFilters(activeItems, filters);
  const hasUnapproved = activeItems.some(
    (item) => item.isNew && !item.approved
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const columnNames = columns.map((c) => c.name);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getColumnItems = useCallback(
    (column: string) =>
      filteredItems
        .filter((item) => item.column === column)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [filteredItems]
  );

  function findColumnForItem(itemId: string): string | undefined {
    return activeItems.find((item) => item.id === itemId)?.column;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(_event: DragOverEvent) {
    // Visual feedback handled by isOver in columns
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
    if (columnNames.includes(overId)) {
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

  function handleAddColumn() {
    const name = newColumnName.trim();
    if (name) {
      addColumn(name);
      setNewColumnName("");
      setIsAddingColumn(false);
    }
  }

  const activeItem = activeId
    ? activeItems.find((item) => item.id === activeId)
    : null;

  const selectedItem = selectedItemId
    ? kanbanItems.find((item) => item.id === selectedItemId)
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
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.name}
              column={col}
              items={getColumnItems(col.name)}
              teamMembers={teamMembers}
              onApprove={approveItem}
              onDismiss={dismissItem}
              onSelect={setSelectedItemId}
              onAddItem={addItem}
              onUpdateColumn={updateColumn}
              onDeleteColumn={deleteColumn}
            />
          ))}

          {/* Add column */}
          {isAddingColumn ? (
            <div className="flex flex-col rounded-lg bg-muted/30 border border-border/50 min-w-[260px] w-[260px] p-3 gap-2">
              <Input
                placeholder="Column name..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setIsAddingColumn(false);
                    setNewColumnName("");
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn} className="flex-1">
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex items-center justify-center rounded-lg border border-dashed border-border/50 min-w-[260px] w-[260px] h-[100px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              <span className="text-sm font-medium">Add Column</span>
            </button>
          )}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard item={activeItem} teamMembers={teamMembers} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Item Detail Panel */}
      {selectedItem && (
        <KanbanItemDetail
          item={selectedItem}
          columns={columns}
          teamMembers={teamMembers}
          projectId={projectId}
          onClose={() => setSelectedItemId(null)}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
}
