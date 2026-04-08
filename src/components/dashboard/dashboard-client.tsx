"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FolderKanban } from "lucide-react";
import { ProjectGrid } from "./project-grid";
import { BacklogList } from "./backlog-list";
import { ProjectTile } from "./project-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjects } from "@/hooks/use-projects";
import { useBacklog } from "@/hooks/use-backlog";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";

interface DashboardClientProps {
  initialActive: ProjectWithRelations[];
  initialBacklog: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

export function DashboardClient({
  initialActive,
  initialBacklog,
  teamMembers,
}: DashboardClientProps) {
  const {
    projects: activeProjects,
    reorderProjects,
    activateProject,
    mutate: mutateActive,
  } = useProjects("active");

  const {
    backlog: backlogProjects,
    reorderBacklog,
    mutate: mutateBacklog,
  } = useBacklog();

  // Use server data as fallback until SWR hydrates
  const active = activeProjects.length > 0 ? activeProjects : initialActive;
  const backlog =
    backlogProjects.length > 0 ? backlogProjects : initialBacklog;

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeItem =
    active.find((p) => p.id === activeId) ||
    backlog.find((p) => p.id === activeId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Could be used for visual feedback when dragging between zones
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active: dragActive, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeItemId = dragActive.id as string;
      const overId = over.id as string;

      // Check if the dragged item is from the backlog
      const isFromBacklog = backlog.some((p) => p.id === activeItemId);
      // Check if dropped over the active grid area or an active project
      const isOverActiveZone =
        overId === "active-grid" ||
        active.some((p) => p.id === overId);

      // Dragging from backlog to active grid: activate the project
      if (isFromBacklog && isOverActiveZone) {
        await activateProject(activeItemId);
        mutateBacklog();
        mutateActive();
        return;
      }

      // Reordering within the active grid
      const isWithinActive =
        active.some((p) => p.id === activeItemId) &&
        active.some((p) => p.id === overId);

      if (isWithinActive && activeItemId !== overId) {
        const oldIndex = active.findIndex((p) => p.id === activeItemId);
        const newIndex = active.findIndex((p) => p.id === overId);
        const reordered = arrayMove(active, oldIndex, newIndex);
        const items = reordered.map((p, i) => ({
          id: p.id,
          sortOrder: i,
        }));
        await reorderProjects(items);
        return;
      }

      // Reordering within the backlog
      const isWithinBacklog =
        backlog.some((p) => p.id === activeItemId) &&
        backlog.some((p) => p.id === overId);

      if (isWithinBacklog && activeItemId !== overId) {
        const oldIndex = backlog.findIndex((p) => p.id === activeItemId);
        const newIndex = backlog.findIndex((p) => p.id === overId);
        const reordered = arrayMove(backlog, oldIndex, newIndex);
        const items = reordered.map((p, i) => ({
          id: p.id,
          sortOrder: i,
        }));
        await reorderBacklog(items);
        return;
      }
    },
    [
      active,
      backlog,
      activateProject,
      reorderProjects,
      reorderBacklog,
      mutateActive,
      mutateBacklog,
    ]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Active Projects</h2>
          {active.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No active projects"
              description="Activate a project from the backlog to get started."
            />
          ) : (
            <ProjectGrid projects={active} teamMembers={teamMembers} />
          )}
        </section>

        <section>
          <BacklogList projects={backlog} teamMembers={teamMembers} />
        </section>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2 scale-105 opacity-90">
            <ProjectTile project={activeItem} teamMembers={teamMembers} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
