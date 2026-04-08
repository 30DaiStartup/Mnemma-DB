import { KanbanSkeleton } from "@/components/project/kanban-skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <KanbanSkeleton />
    </div>
  );
}
