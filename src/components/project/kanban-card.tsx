"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, FileText, GripVertical, Calendar, ListChecks } from "lucide-react";
import { NewIndicator } from "./new-indicator";
import { isPast, isToday, format } from "date-fns";
import type { KanbanItemData } from "@/types";
import type { TeamMember } from "@/lib/team";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
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

interface KanbanCardProps {
  item: KanbanItemData;
  teamMembers: TeamMember[];
  onApprove?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function KanbanCard({
  item,
  teamMembers,
  onApprove,
  onDismiss,
  onSelect,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = teamMembers.find((m) => m.id === item.assigneeId);
  const isUnapproved = item.isNew && !item.approved;
  const isFromTranscript = item.source === "transcript";
  const labels = item.labels ?? [];
  const hasSubtasks = (item.subtaskCount ?? 0) > 0;
  const dueDate = item.dueDate ? new Date(item.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && item.column !== "Done";
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => !isDragging && onSelect?.(item.id)}
      className="cursor-pointer"
    >
      <Card
        size="sm"
        className={`${
          isDragging ? "opacity-50 shadow-lg" : ""
        } ${
          isUnapproved
            ? "border-dashed border-blue-500/40 ring-blue-500/20"
            : ""
        } hover:border-primary/30 transition-colors`}
      >
        <div className="px-3 py-2 space-y-1.5">
          {/* Header row: drag handle + title + transcript icon */}
          <div className="flex items-start gap-1.5">
            <button
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium leading-tight truncate">
                  {item.title}
                </span>
                {isFromTranscript && (
                  <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex items-center gap-1 pl-5">
              {labels.slice(0, 4).map((label) => (
                <span
                  key={label.id}
                  className="w-4 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
              {labels.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{labels.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Description preview */}
          {item.description && (
            <p className="text-xs text-muted-foreground truncate pl-5">
              {item.description.slice(0, 60)}
            </p>
          )}

          {/* Due date + subtask progress */}
          {(dueDate || hasSubtasks) && (
            <div className="flex items-center gap-3 pl-5">
              {dueDate && (
                <span
                  className={`flex items-center gap-1 text-[10px] ${
                    isOverdue
                      ? "text-red-400"
                      : isDueToday
                        ? "text-amber-400"
                        : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {format(dueDate, "MMM d")}
                </span>
              )}
              {hasSubtasks && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ListChecks className="w-3 h-3" />
                  {item.subtaskCompletedCount}/{item.subtaskCount}
                </span>
              )}
            </div>
          )}

          {/* New indicator */}
          {isUnapproved && <NewIndicator />}

          {/* Footer: assignee + priority + actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {assignee && (
                <Avatar size="sm">
                  <AvatarFallback
                    className={`${getAvatarColor(assignee.id)} text-white text-[10px] font-medium`}
                  >
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <Badge
                variant="outline"
                className={`text-[10px] h-4 px-1.5 ${PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.medium}`}
              >
                {item.priority}
              </Badge>
            </div>

            {isUnapproved && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(item.id);
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss?.(item.id);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
