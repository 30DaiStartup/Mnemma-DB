"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2, Gauge, Plus, X } from "lucide-react";
import { KanbanCard } from "./kanban-card";
import type { KanbanItemData, KanbanColumnData } from "@/types";
import type { TeamMember } from "@/lib/team";

interface KanbanColumnProps {
  id: string;
  column: KanbanColumnData;
  items: KanbanItemData[];
  teamMembers: TeamMember[];
  onApprove?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSelect?: (id: string) => void;
  onAddItem?: (column: string, title: string) => void;
  onUpdateColumn?: (columnId: string, data: { name?: string; wipLimit?: number }) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanColumn({
  id,
  column,
  items,
  teamMembers,
  onApprove,
  onDismiss,
  onSelect,
  onAddItem,
  onUpdateColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.name);
  const [isSettingWip, setIsSettingWip] = useState(false);
  const [wipValue, setWipValue] = useState(String(column.wipLimit || ""));
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");

  const wipLimit = column.wipLimit;
  const isOverWip = wipLimit > 0 && items.length > wipLimit;
  const isAtWip = wipLimit > 0 && items.length === wipLimit;

  function handleRename() {
    const name = renameValue.trim();
    if (name && name !== column.name) {
      onUpdateColumn?.(column.id, { name });
    }
    setIsRenaming(false);
  }

  function handleSetWip() {
    const limit = parseInt(wipValue) || 0;
    onUpdateColumn?.(column.id, { wipLimit: limit });
    setIsSettingWip(false);
  }

  function handleAddItem() {
    const title = newItemTitle.trim();
    if (title) {
      onAddItem?.(column.name, title);
      setNewItemTitle("");
      setIsAdding(false);
    }
  }

  return (
    <div
      className={`flex flex-col rounded-lg bg-muted/30 border min-w-[280px] w-[280px] ${
        isOver ? "ring-2 ring-primary/30 border-primary/30" : "border-border/50"
      } ${isOverWip ? "border-red-500/50" : isAtWip ? "border-amber-500/50" : ""}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
        {isRenaming ? (
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            onBlur={handleRename}
            className="h-6 text-sm font-semibold"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-semibold text-foreground">{column.name}</h3>
        )}
        <div className="flex items-center gap-1">
          <span
            className={`text-xs rounded-full px-2 py-0.5 ${
              isOverWip
                ? "bg-red-500/15 text-red-400"
                : isAtWip
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-muted text-muted-foreground"
            }`}
            title={wipLimit > 0 ? `WIP limit: ${wipLimit}` : undefined}
          >
            {items.length}
            {wipLimit > 0 && `/${wipLimit}`}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setRenameValue(column.name);
                  setIsRenaming(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setWipValue(String(column.wipLimit || ""));
                  setIsSettingWip(true);
                }}
              >
                <Gauge className="w-3.5 h-3.5 mr-2" />
                Set WIP Limit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteColumn?.(column.id)}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* WIP limit setter */}
      {isSettingWip && (
        <div className="px-3 py-2 border-b border-border/50 flex gap-2">
          <Input
            type="number"
            min={0}
            placeholder="0 = no limit"
            value={wipValue}
            onChange={(e) => setWipValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSetWip();
              if (e.key === "Escape") setIsSettingWip(false);
            }}
            className="h-7 text-xs"
            autoFocus
          />
          <Button size="sm" className="h-7 text-xs" onClick={handleSetWip}>
            Set
          </Button>
        </div>
      )}

      {/* Items */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[100px]"
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              teamMembers={teamMembers}
              onApprove={onApprove}
              onDismiss={onDismiss}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            No items
          </div>
        )}
      </div>

      {/* Quick add */}
      <div className="p-2 border-t border-border/50">
        {isAdding ? (
          <div className="flex gap-1.5">
            <Input
              placeholder="Item title..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewItemTitle("");
                }
              }}
              className="h-7 text-xs"
              autoFocus
            />
            <Button size="sm" className="h-7 px-2" onClick={handleAddItem}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => {
                setIsAdding(false);
                setNewItemTitle("");
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
        )}
      </div>
    </div>
  );
}
