"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ListChecks, ArrowUp, ArrowDown } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { KanbanItemData, KanbanColumnData, KanbanFilters } from "@/types";
import type { TeamMember } from "@/lib/team";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
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

type SortField = "title" | "column" | "priority" | "assignee" | "dueDate";
type SortDir = "asc" | "desc";

interface KanbanListViewProps {
  items: KanbanItemData[];
  columns: KanbanColumnData[];
  teamMembers: TeamMember[];
  filters?: KanbanFilters;
  onSelect: (id: string) => void;
}

export function KanbanListView({
  items,
  columns,
  teamMembers,
  onSelect,
}: KanbanListViewProps) {
  const [sortField, setSortField] = useState<SortField>("column");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const columnOrder = useMemo(() => {
    const map = new Map<string, number>();
    columns.forEach((c, i) => map.set(c.name, i));
    return map;
  }, [columns]);

  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [teamMembers]);

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "column":
          cmp =
            (columnOrder.get(a.column) ?? 99) -
            (columnOrder.get(b.column) ?? 99);
          break;
        case "priority":
          cmp =
            (PRIORITY_ORDER[a.priority] ?? 99) -
            (PRIORITY_ORDER[b.priority] ?? 99);
          break;
        case "assignee": {
          const aName = memberMap.get(a.assigneeId)?.name ?? "zzz";
          const bName = memberMap.get(b.assigneeId)?.name ?? "zzz";
          cmp = aName.localeCompare(bName);
          break;
        }
        case "dueDate": {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = aDate - bDate;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [items, sortField, sortDir, columnOrder, memberMap]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField]
  );

  const SortIcon = sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {(
              [
                ["title", "Title"],
                ["column", "Status"],
                ["priority", "Priority"],
                ["assignee", "Assignee"],
                ["dueDate", "Due Date"],
              ] as [SortField, string][]
            ).map(([field, label]) => (
              <TableHead
                key={field}
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort(field)}
              >
                <div className="flex items-center gap-1">
                  {label}
                  {sortField === field && (
                    <SortIcon className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead>Labels</TableHead>
            <TableHead>Subtasks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => {
            const assignee = memberMap.get(item.assigneeId);
            const dueDate = item.dueDate ? new Date(item.dueDate) : null;
            const isOverdue =
              dueDate && isPast(dueDate) && !isToday(dueDate) && item.column !== "Done";
            const isDueToday = dueDate && isToday(dueDate);
            const hasSubtasks = (item.subtaskCount ?? 0) > 0;
            const labels = item.labels ?? [];

            return (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(item.id)}
              >
                <TableCell className="font-medium max-w-[250px] truncate">
                  {item.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {item.column}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${PRIORITY_COLORS[item.priority] ?? ""}`}
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar size="sm">
                        <AvatarFallback
                          className={`${getAvatarColor(assignee.id)} text-white text-[8px]`}
                        >
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {dueDate ? (
                    <span
                      className={`flex items-center gap-1 text-xs ${
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
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {labels.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {labels.slice(0, 3).map((l) => (
                        <span
                          key={l.id}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: l.color }}
                          title={l.name}
                        />
                      ))}
                      {labels.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{labels.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {hasSubtasks ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ListChecks className="w-3 h-3" />
                      {item.subtaskCompletedCount}/{item.subtaskCount}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {sortedItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                No items match your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
