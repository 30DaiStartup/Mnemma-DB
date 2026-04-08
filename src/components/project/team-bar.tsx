"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamAssignmentData } from "@/types";
import type { TeamMember } from "@/lib/team";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-pink-600",
  "bg-teal-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
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

interface TeamBarProps {
  teamAssignments: TeamAssignmentData[];
  teamMembers: TeamMember[];
  leadId: string;
}

export function TeamBar({ teamAssignments, teamMembers, leadId }: TeamBarProps) {
  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));

  const assignedMembers = teamAssignments
    .map((ta) => ({
      assignment: ta,
      member: memberMap.get(ta.memberId),
    }))
    .filter(
      (entry): entry is { assignment: TeamAssignmentData; member: TeamMember } =>
        entry.member !== undefined
    );

  // Sort lead to front
  assignedMembers.sort((a, b) => {
    if (a.member.id === leadId) return -1;
    if (b.member.id === leadId) return 1;
    return 0;
  });

  if (assignedMembers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No team members assigned</div>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {assignedMembers.map(({ assignment, member }) => {
        const isLead = member.id === leadId;
        return (
          <div
            key={assignment.id}
            className="flex items-center gap-2 shrink-0"
          >
            <div
              className={
                isLead
                  ? "rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-background"
                  : ""
              }
            >
              <Avatar size="default">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback
                  className={`${getAvatarColor(member.id)} text-white text-xs font-medium`}
                >
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">
                {member.name}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {assignment.role}
              </span>
            </div>
            {isLead && (
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-500/50 text-[10px] px-1.5 h-4"
              >
                Lead
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
