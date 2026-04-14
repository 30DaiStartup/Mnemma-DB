"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Trash2, User, Flag, Columns3 } from "lucide-react";
import { KanbanSubtaskList } from "./kanban-subtask-list";
import { KanbanActivityFeed } from "./kanban-activity-feed";
import { KanbanLabelPicker } from "./kanban-label-picker";
import { format } from "date-fns";
import type { KanbanItemData, KanbanColumnData } from "@/types";
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

interface KanbanItemDetailProps {
  item: KanbanItemData;
  columns: KanbanColumnData[];
  teamMembers: TeamMember[];
  projectId: string;
  onClose: () => void;
  onUpdate: (itemId: string, data: Record<string, unknown>) => void;
  onDelete: (itemId: string) => void;
}

export function KanbanItemDetail({
  item,
  columns,
  teamMembers,
  projectId,
  onClose,
  onUpdate,
  onDelete,
}: KanbanItemDetailProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);

  const handleTitleBlur = useCallback(() => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== item.title) {
      onUpdate(item.id, { title: trimmed });
    }
  }, [title, item.title, item.id, onUpdate]);

  const handleDescriptionBlur = useCallback(() => {
    if (description !== item.description) {
      onUpdate(item.id, { description });
    }
  }, [description, item.description, item.id, onUpdate]);

  const assignee = teamMembers.find((m) => m.id === item.assigneeId);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Edit Item</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Editable title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
          />

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Columns3 className="w-3.5 h-3.5" />
                Status
              </label>
              <Select
                value={item.column}
                onValueChange={(v) => onUpdate(item.id, { column: v })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </label>
              <Select
                value={item.priority}
                onValueChange={(v) => onUpdate(item.id, { priority: v })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map((p) => (
                    <SelectItem key={p} value={p}>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1.5 ${PRIORITY_COLORS[p]}`}
                      >
                        {p}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <User className="w-3.5 h-3.5" />
                Assignee
              </label>
              <Select
                value={item.assigneeId || "__unassigned__"}
                onValueChange={(v) =>
                  onUpdate(item.id, {
                    assigneeId: v === "__unassigned__" ? "" : v,
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue>
                    {assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar size="sm">
                          <AvatarFallback
                            className={`${getAvatarColor(assignee.id)} text-white text-[8px]`}
                          >
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{assignee.name}</span>
                      </div>
                    ) : (
                      "Unassigned"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <Input
                type="date"
                value={
                  item.dueDate
                    ? format(new Date(item.dueDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  onUpdate(item.id, {
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Labels
            </label>
            <KanbanLabelPicker
              projectId={projectId}
              itemId={item.id}
              currentLabels={item.labels ?? []}
            />
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          <Separator />

          {/* Subtasks */}
          <KanbanSubtaskList itemId={item.id} />

          <Separator />

          {/* Activity */}
          <KanbanActivityFeed itemId={item.id} />

          <Separator />

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full justify-start"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
