"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Star, Plus, X, Search } from "lucide-react";
import type { TeamAssignmentData } from "@/types";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface TeamSelectorProps {
  projectId: string;
  roster: TeamMember[];
  initialAssignments: TeamAssignmentData[];
  initialLeadId: string;
}

export function TeamSelector({
  projectId,
  roster,
  initialAssignments,
  initialLeadId,
}: TeamSelectorProps) {
  const [assignments, setAssignments] =
    useState<TeamAssignmentData[]>(initialAssignments);
  const [leadId, setLeadId] = useState(initialLeadId);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedIds = useMemo(
    () => new Set(assignments.map((a) => a.memberId)),
    [assignments]
  );

  const filteredRoster = useMemo(() => {
    if (!search) return roster;
    const q = search.toLowerCase();
    return roster.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [roster, search]);

  const persist = useCallback(
    async (memberIds: string[], newLeadId: string) => {
      try {
        await fetch(`/api/projects/${projectId}/team`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            members: memberIds.map((id) => ({
              memberId: id,
              role: id === newLeadId ? "lead" : "member",
            })),
            leadId: newLeadId,
          }),
        });
      } catch (err) {
        console.error("Failed to update team:", err);
      }
    },
    [projectId]
  );

  const toggleMember = useCallback(
    (memberId: string) => {
      let newAssignments: TeamAssignmentData[];
      let newLeadId = leadId;

      if (selectedIds.has(memberId)) {
        newAssignments = assignments.filter((a) => a.memberId !== memberId);
        if (leadId === memberId) {
          newLeadId = newAssignments.length > 0 ? newAssignments[0].memberId : "";
        }
      } else {
        newAssignments = [
          ...assignments,
          {
            id: "",
            projectId,
            memberId,
            role: "member",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        if (newAssignments.length === 1) {
          newLeadId = memberId;
        }
      }

      setAssignments(newAssignments);
      setLeadId(newLeadId);
      persist(
        newAssignments.map((a) => a.memberId),
        newLeadId
      );
    },
    [assignments, leadId, projectId, selectedIds, persist]
  );

  const toggleLead = useCallback(
    (memberId: string) => {
      const newLeadId = leadId === memberId ? "" : memberId;
      setLeadId(newLeadId);
      persist(
        assignments.map((a) => a.memberId),
        newLeadId
      );
    },
    [assignments, leadId, persist]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      const newAssignments = assignments.filter(
        (a) => a.memberId !== memberId
      );
      let newLeadId = leadId;
      if (leadId === memberId) {
        newLeadId =
          newAssignments.length > 0 ? newAssignments[0].memberId : "";
      }
      setAssignments(newAssignments);
      setLeadId(newLeadId);
      persist(
        newAssignments.map((a) => a.memberId),
        newLeadId
      );
    },
    [assignments, leadId, persist]
  );

  const getMember = (id: string) => roster.find((m) => m.id === id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Team</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button variant="ghost" size="sm" />}
          >
            <Plus className="size-3.5" />
            Add
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Team Members</DialogTitle>
              <DialogDescription>
                Search and select members from the team roster.
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="pl-8"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-0.5">
              {filteredRoster.map((member) => {
                const isSelected = selectedIds.has(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <Avatar className="size-7">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-[10px]">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {member.role}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
              {filteredRoster.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No members found.
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" size="sm" />}>
                Done
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No team members assigned yet.
        </p>
      )}

      <div className="space-y-1.5">
        {assignments.map((assignment) => {
          const member = getMember(assignment.memberId);
          if (!member) return null;
          const isLead = leadId === member.id;

          return (
            <div
              key={assignment.memberId}
              className="group flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2 transition-colors hover:bg-accent/30"
            >
              <Avatar className="size-7">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-[10px]">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {member.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {member.role}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => toggleLead(member.id)}
                className={`size-6 ${
                  isLead
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-muted-foreground/40 hover:text-amber-500 opacity-0 group-hover:opacity-100"
                }`}
                title={isLead ? "Remove as lead" : "Set as lead"}
              >
                <Star
                  className="size-3.5"
                  fill={isLead ? "currentColor" : "none"}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeMember(member.id)}
                className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
