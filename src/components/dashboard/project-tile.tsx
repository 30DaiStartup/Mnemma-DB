"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import type { ProjectWithRelations } from "@/types";
import type { TeamMember } from "@/lib/team";

const PHASE_COLORS: Record<string, string> = {
  Discussion: "bg-blue-500/20 text-blue-400",
  Prototype: "bg-purple-500/20 text-purple-400",
  Feedback: "bg-amber-500/20 text-amber-400",
  Iteration: "bg-orange-500/20 text-orange-400",
  Production: "bg-green-500/20 text-green-400",
  Discovery: "bg-blue-500/20 text-blue-400",
  Planning: "bg-indigo-500/20 text-indigo-400",
  Drafting: "bg-purple-500/20 text-purple-400",
  Review: "bg-amber-500/20 text-amber-400",
  Implementation: "bg-green-500/20 text-green-400",
};

const HEALTH_CONFIG: Record<string, { color: string; label: string }> = {
  "on-track": { color: "bg-emerald-500", label: "On Track" },
  "at-risk": { color: "bg-yellow-500", label: "At Risk" },
  blocked: { color: "bg-red-500", label: "Blocked" },
};

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-pink-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface ProjectTileProps {
  project: ProjectWithRelations;
  teamMembers: TeamMember[];
}

export function ProjectTile({ project, teamMembers }: ProjectTileProps) {
  const lead = teamMembers.find((m) => m.id === project.leadId);

  const assignedMemberIds = project.teamAssignments.map((a) => a.memberId);
  const assignedMembers = assignedMemberIds
    .map((id) => teamMembers.find((m) => m.id === id))
    .filter(Boolean) as TeamMember[];

  const maxAvatars = 4;
  const visibleMembers = assignedMembers.slice(0, maxAvatars);
  const overflowCount = assignedMembers.length - maxAvatars;

  const health = HEALTH_CONFIG[project.health] || HEALTH_CONFIG["on-track"];
  const phaseColor =
    PHASE_COLORS[project.phase] || "bg-muted text-muted-foreground";

  return (
    <Card className="transition-shadow hover:ring-2 hover:ring-foreground/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="hover:underline"
          >
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-block size-2.5 rounded-full ${health.color}`}
              title={health.label}
            />
          </div>
        </div>
        {lead && (
          <p className="text-xs text-muted-foreground">
            Lead: {lead.name}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${phaseColor}`}
          >
            {project.phase || "No Phase"}
          </span>
          <Badge variant="outline" className="text-xs capitalize">
            {project.type}
          </Badge>
        </div>

        {project.nextStep && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.nextStep}
          </p>
        )}

        {assignedMembers.length > 0 && (
          <AvatarGroup>
            {visibleMembers.map((member) => (
              <Avatar key={member.id} size="sm">
                <AvatarFallback
                  className={`${getAvatarColor(member.id)} text-white text-[10px]`}
                >
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflowCount > 0 && (
              <AvatarGroupCount className="text-xs">
                +{overflowCount}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        )}
      </CardContent>
    </Card>
  );
}
