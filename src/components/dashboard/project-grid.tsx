"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectTile } from "./project-tile";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";

interface SortableProjectTileProps {
  project: ProjectWithRelations;
  teamMembers: TeamMember[];
}

function SortableProjectTile({
  project,
  teamMembers,
}: SortableProjectTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <ProjectTile project={project} teamMembers={teamMembers} />
    </div>
  );
}

interface ProjectGridProps {
  projects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

export function ProjectGrid({ projects, teamMembers }: ProjectGridProps) {
  const { setNodeRef } = useDroppable({
    id: "active-grid",
  });

  return (
    <div ref={setNodeRef}>
      <SortableContext
        items={projects.map((p) => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <SortableProjectTile
              key={project.id}
              project={project}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
