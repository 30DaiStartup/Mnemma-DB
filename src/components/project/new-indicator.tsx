import { Badge } from "@/components/ui/badge";

export function NewIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
      </span>
      <Badge
        variant="outline"
        className="text-blue-400 border-blue-400/50 text-[10px] px-1 h-4"
      >
        New
      </Badge>
    </div>
  );
}
