"use client";

import Link from "next/link";
import { Users, FolderKanban, Inbox } from "lucide-react";
import type { TeamMember } from "@/lib/team";

interface TeamCardProps {
  team: {
    slug: string;
    name: string;
    description: string;
    projectCount: number;
    backlogCount: number;
    members: TeamMember[];
  };
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold group-hover:underline">
          {team.name}
        </h3>
        <Users className="size-4 text-muted-foreground" />
      </div>

      {team.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {team.description}
        </p>
      )}

      {/* Member avatars */}
      <div className="flex -space-x-1.5">
        {team.members.slice(0, 6).map((member) => (
          <div
            key={member.id}
            className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium"
            title={member.name}
          >
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        ))}
        {team.members.length > 6 && (
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
            +{team.members.length - 6}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FolderKanban className="size-3" />
          {team.projectCount} project{team.projectCount !== 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <Inbox className="size-3" />
          {team.backlogCount} in backlog
        </span>
      </div>
    </Link>
  );
}
