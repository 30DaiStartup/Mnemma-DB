"use client";

import { useState } from "react";
import { KanbanBoard } from "./kanban-board";
import { KanbanListView } from "./kanban-list-view";
import { KanbanItemDetail } from "./kanban-item-detail";
import { KanbanToolbar, EMPTY_FILTERS } from "./kanban-toolbar";
import { DismissedSection } from "./dismissed-section";
import { useKanban } from "@/hooks/use-kanban";
import { useKanbanColumns } from "@/hooks/use-kanban-columns";
import { useKanbanLabels } from "@/hooks/use-kanban-labels";
import type { KanbanItemData, KanbanFilters } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanSectionProps {
  projectId: string;
  initialItems: KanbanItemData[];
  teamMembers: TeamMember[];
}

function applyFilters(items: KanbanItemData[], filters: KanbanFilters): KanbanItemData[] {
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

export function KanbanSection({
  projectId,
  initialItems,
  teamMembers,
}: KanbanSectionProps) {
  const { items, restoreItem, updateItem, deleteItem } = useKanban(projectId);
  const { columns } = useKanbanColumns(projectId);
  const { labels } = useKanbanLabels(projectId);
  const [filters, setFilters] = useState<KanbanFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<"board" | "list">("board");
  const [listSelectedItemId, setListSelectedItemId] = useState<string | null>(null);

  const kanbanItems = items.length > 0 ? items : initialItems;
  const activeItems = kanbanItems.filter((i) => !i.dismissed);
  const filteredItems = applyFilters(activeItems, filters);

  const listSelectedItem = listSelectedItemId
    ? kanbanItems.find((i) => i.id === listSelectedItemId)
    : null;

  return (
    <div className="space-y-4">
      <KanbanToolbar
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
        teamMembers={teamMembers}
        labels={labels}
      />

      {view === "board" ? (
        <KanbanBoard
          projectId={projectId}
          initialItems={kanbanItems.filter((i) => !i.dismissed)}
          teamMembers={teamMembers}
          filters={filters}
        />
      ) : (
        <>
          <KanbanListView
            items={filteredItems}
            columns={columns}
            teamMembers={teamMembers}
            filters={filters}
            onSelect={setListSelectedItemId}
          />
          {listSelectedItem && (
            <KanbanItemDetail
              item={listSelectedItem}
              columns={columns}
              teamMembers={teamMembers}
              projectId={projectId}
              onClose={() => setListSelectedItemId(null)}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          )}
        </>
      )}

      <DismissedSection
        items={kanbanItems}
        onRestore={restoreItem}
      />
    </div>
  );
}
