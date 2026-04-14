"use client";

import Link from "next/link";
import { FolderKanban, Inbox, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyWork } from "@/hooks/use-my-work";

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function MyWorkList() {
  const { projects, assignedItems, isLoading } = useMyWork();

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (projects.length === 0 && assignedItems.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No assigned work"
        description="You don't have any projects or tasks assigned to you."
      />
    );
  }

  // Group assigned items by project
  const itemsByProject = new Map<string, typeof assignedItems>();
  for (const item of assignedItems) {
    const key = item.project.id;
    if (!itemsByProject.has(key)) {
      itemsByProject.set(key, []);
    }
    itemsByProject.get(key)!.push(item);
  }

  return (
    <div className="space-y-6">
      {/* Projects I'm on */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          My Projects
        </h3>
        <div className="flex flex-col gap-2">
          {projects.map((project) => {
            const projectItems = itemsByProject.get(project.id) || [];
            const todoCount = projectItems.filter(
              (i) => i.column !== "Done"
            ).length;
            const doneCount = projectItems.filter(
              (i) => i.column === "Done"
            ).length;

            return (
              <Link
                key={project.id}
                href={
                  project.status === "backlog"
                    ? `/backlog/${project.id}`
                    : `/projects/${project.id}`
                }
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <FolderKanban className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {project.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {project.phase || project.status}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs capitalize">
                  {project.status}
                </Badge>
                {todoCount > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {todoCount} task{todoCount !== 1 ? "s" : ""} to do
                  </span>
                )}
                {doneCount > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3" />
                    {doneCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Assigned tasks grouped by project */}
      {assignedItems.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Assigned Tasks
          </h3>
          <div className="flex flex-col gap-2">
            {assignedItems
              .filter((item) => item.column !== "Done")
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.project.id}`}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.project.name}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs capitalize ${priorityColors[item.priority] || ""}`}
                  >
                    {item.priority}
                  </Badge>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {item.column}
                  </Badge>
                  {item.subtaskCount > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.subtaskCompletedCount}/{item.subtaskCount}
                    </span>
                  )}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
