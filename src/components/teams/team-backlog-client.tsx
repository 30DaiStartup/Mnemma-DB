"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Inbox, FolderKanban } from "lucide-react";
import { BacklogItem } from "@/components/dashboard/backlog-item";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamBacklog } from "@/hooks/use-team-backlog";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TeamBacklogClientProps {
  slug: string;
  initialBacklog: ProjectWithRelations[];
  activeProjects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

export function TeamBacklogClient({
  slug,
  initialBacklog,
  activeProjects,
  teamMembers,
}: TeamBacklogClientProps) {
  const { backlog, reorderBacklog } = useTeamBacklog(slug);
  const projects = backlog.length > 0 ? backlog : initialBacklog;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(projects, oldIndex, newIndex);
    const items = reordered.map((p, i) => ({ id: p.id, sortOrder: i }));
    reorderBacklog(items);
  }

  return (
    <div className="space-y-8">
      {/* Active projects context */}
      {activeProjects.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {activeProjects.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {activeProjects.map((project) => {
              const lead = teamMembers.find((m) => m.id === project.leadId);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <FolderKanban className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {project.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs capitalize"
                  >
                    {project.phase || project.status}
                  </Badge>
                  {lead && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {lead.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Team backlog */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold">Team Backlog</h2>
          <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {projects.length}
          </span>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {projects.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title="No backlog items"
                  description="This team has no projects in backlog."
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
        </DndContext>
      </div>
    </div>
  );
}
