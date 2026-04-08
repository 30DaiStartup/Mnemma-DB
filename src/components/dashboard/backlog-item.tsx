"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";

interface BacklogItemProps {
  project: ProjectWithRelations;
  teamMembers: TeamMember[];
}

export function BacklogItem({ project, teamMembers }: BacklogItemProps) {
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

  const lead = teamMembers.find((m) => m.id === project.leadId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <Link
        href={`/backlog/${project.id}`}
        className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
      >
        {project.name}
      </Link>

      <Badge variant="outline" className="shrink-0 text-xs capitalize">
        {project.type}
      </Badge>

      {lead && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {lead.name}
        </span>
      )}
    </div>
  );
}
