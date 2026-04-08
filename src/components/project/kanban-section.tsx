"use client";

import { KanbanBoard } from "./kanban-board";
import { DismissedSection } from "./dismissed-section";
import { useKanban } from "@/hooks/use-kanban";
import type { KanbanItemData } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanSectionProps {
  projectId: string;
  initialItems: KanbanItemData[];
  teamMembers: TeamMember[];
}

export function KanbanSection({
  projectId,
  initialItems,
  teamMembers,
}: KanbanSectionProps) {
  const { items, restoreItem } = useKanban(projectId);
  const kanbanItems = items.length > 0 ? items : initialItems;

  return (
    <div className="space-y-4">
      <KanbanBoard
        projectId={projectId}
        initialItems={kanbanItems.filter((i) => !i.dismissed)}
        teamMembers={teamMembers}
      />
      <DismissedSection
        items={kanbanItems}
        onRestore={restoreItem}
      />
    </div>
  );
}
