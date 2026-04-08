"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";
import { BacklogItem } from "./backlog-item";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";

interface BacklogListProps {
  projects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

export function BacklogList({ projects, teamMembers }: BacklogListProps) {
  const { setNodeRef } = useDroppable({
    id: "backlog-list",
  });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Backlog</h2>
        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {projects.length}
        </span>
      </div>
      <div ref={setNodeRef}>
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {projects.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Backlog is empty"
                description="No items in the backlog yet."
              />
            )}
            {projects.map((project) => (
              <BacklogItem
                key={project.id}
                project={project}
                teamMembers={teamMembers}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
