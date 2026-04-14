"use client";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutGrid,
  List,
  X,
  User,
  Flag,
  Calendar,
  Tags,
} from "lucide-react";
import type { KanbanFilters, KanbanLabelData } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanToolbarProps {
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
  view: "board" | "list";
  onViewChange: (view: "board" | "list") => void;
  teamMembers: TeamMember[];
  labels: KanbanLabelData[];
}

const EMPTY_FILTERS: KanbanFilters = {
  search: "",
  assigneeIds: [],
  priorities: [],
  labelIds: [],
  dueDateFilter: null,
};

const triggerBase =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors cursor-pointer";
const triggerActive =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors cursor-pointer";

export function KanbanToolbar({
  filters,
  onFiltersChange,
  view,
  onViewChange,
  teamMembers,
  labels,
}: KanbanToolbarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.assigneeIds.length > 0 ||
    filters.priorities.length > 0 ||
    filters.labelIds.length > 0 ||
    filters.dueDateFilter;

  function toggleArrayFilter(
    key: "assigneeIds" | "priorities" | "labelIds",
    value: string
  ) {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="h-8 pl-8 text-xs"
        />
      </div>

      {/* Assignee filter */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={filters.assigneeIds.length > 0 ? triggerActive : triggerBase}
        >
          <User className="w-3.5 h-3.5" />
          Assignee
          {filters.assigneeIds.length > 0 && (
            <span className="bg-primary/20 text-primary rounded-full px-1.5 text-[10px]">
              {filters.assigneeIds.length}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {teamMembers.map((m) => (
            <DropdownMenuCheckboxItem
              key={m.id}
              checked={filters.assigneeIds.includes(m.id)}
              onCheckedChange={() => toggleArrayFilter("assigneeIds", m.id)}
            >
              {m.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority filter */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={filters.priorities.length > 0 ? triggerActive : triggerBase}
        >
          <Flag className="w-3.5 h-3.5" />
          Priority
          {filters.priorities.length > 0 && (
            <span className="bg-primary/20 text-primary rounded-full px-1.5 text-[10px]">
              {filters.priorities.length}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {["critical", "high", "medium", "low"].map((p) => (
            <DropdownMenuCheckboxItem
              key={p}
              checked={filters.priorities.includes(p)}
              onCheckedChange={() => toggleArrayFilter("priorities", p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Label filter */}
      {labels.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={filters.labelIds.length > 0 ? triggerActive : triggerBase}
          >
            <Tags className="w-3.5 h-3.5" />
            Labels
            {filters.labelIds.length > 0 && (
              <span className="bg-primary/20 text-primary rounded-full px-1.5 text-[10px]">
                {filters.labelIds.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {labels.map((l) => (
              <DropdownMenuCheckboxItem
                key={l.id}
                checked={filters.labelIds.includes(l.id)}
                onCheckedChange={() => toggleArrayFilter("labelIds", l.id)}
              >
                <span
                  className="w-3 h-3 rounded-full mr-2 inline-block"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Due date filter */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={filters.dueDateFilter ? triggerActive : triggerBase}
        >
          <Calendar className="w-3.5 h-3.5" />
          Due Date
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">Due Date</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(
            [
              ["overdue", "Overdue"],
              ["today", "Due Today"],
              ["this-week", "Due This Week"],
              ["no-date", "No Date"],
            ] as const
          ).map(([value, label]) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.dueDateFilter === value}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  dueDateFilter: checked ? value : null,
                })
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
          onClick={() => onFiltersChange(EMPTY_FILTERS)}
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* View toggle */}
      <div className="flex items-center border border-border rounded-md overflow-hidden">
        <button
          onClick={() => onViewChange("board")}
          className={`p-1.5 ${
            view === "board"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`p-1.5 ${
            view === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export { EMPTY_FILTERS };
