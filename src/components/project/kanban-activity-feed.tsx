"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ArrowRight, User, Flag, Tag, Send, Activity } from "lucide-react";
import { useKanbanActivity } from "@/hooks/use-kanban-activity";
import { formatDistanceToNow } from "date-fns";
import type { KanbanActivityData } from "@/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  comment: <MessageSquare className="w-3 h-3" />,
  status_change: <ArrowRight className="w-3 h-3" />,
  assignment: <User className="w-3 h-3" />,
  priority: <Flag className="w-3 h-3" />,
  label: <Tag className="w-3 h-3" />,
  created: <Activity className="w-3 h-3" />,
};

function formatActivity(activity: KanbanActivityData): string {
  const meta = activity.metadata as Record<string, string>;
  switch (activity.type) {
    case "comment":
      return activity.content;
    case "status_change":
      return `Moved from "${meta.from}" to "${meta.to}"`;
    case "assignment":
      return meta.to
        ? `Assigned to ${meta.to}`
        : "Unassigned";
    case "priority":
      return `Priority changed from ${meta.from} to ${meta.to}`;
    case "label":
      return activity.content || "Label updated";
    case "created":
      return "Item created";
    default:
      return activity.content || "Activity";
  }
}

interface KanbanActivityFeedProps {
  itemId: string;
}

export function KanbanActivityFeed({ itemId }: KanbanActivityFeedProps) {
  const { activities, addComment } = useKanbanActivity(itemId);
  const [comment, setComment] = useState("");

  function handleSubmit() {
    const text = comment.trim();
    if (text) {
      addComment(text);
      setComment("");
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Activity className="w-3.5 h-3.5" />
        Activity
      </label>

      {/* Comment input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          className="min-h-[60px] text-sm resize-none"
        />
        {comment.trim() && (
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={handleSubmit}
          >
            <Send className="w-3 h-3" />
            Comment
          </Button>
        )}
      </div>

      {/* Activity timeline */}
      {activities.length > 0 && (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-2 text-xs"
            >
              <div className="mt-0.5 p-1 rounded bg-muted text-muted-foreground shrink-0">
                {TYPE_ICONS[activity.type] ?? TYPE_ICONS.created}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={
                    activity.type === "comment"
                      ? "text-foreground whitespace-pre-wrap"
                      : "text-muted-foreground"
                  }
                >
                  {formatActivity(activity)}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No activity yet</p>
      )}
    </div>
  );
}
