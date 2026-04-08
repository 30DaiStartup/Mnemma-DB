"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { ProjectWithRelations } from "@/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface PlanningFormProps {
  project: ProjectWithRelations;
}

export function PlanningForm({ project }: PlanningFormProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [type, setType] = useState(project.type);
  const [notes, setNotes] = useState(
    (project.metadata as Record<string, unknown>)?.notes as string ?? ""
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(
    async (fields: Record<string, unknown>) => {
      setStatus("saving");
      if (savedTimer.current) clearTimeout(savedTimer.current);

      try {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });

        if (!res.ok) throw new Error("Save failed");

        setStatus("saved");
        savedTimer.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
        savedTimer.current = setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [project.id]
  );

  const handleNameBlur = () => {
    if (name !== project.name) save({ name });
  };

  const handleDescriptionBlur = () => {
    if (description !== project.description) save({ description });
  };

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    setType(value);
    save({ type: value });
  };

  const handleNotesBlur = () => {
    const currentNotes =
      (project.metadata as Record<string, unknown>)?.notes as string ?? "";
    if (notes !== currentNotes) {
      const metadata = JSON.stringify({
        ...(project.metadata as Record<string, unknown>),
        notes,
      });
      save({ metadata });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Project Details
        </h2>
        <StatusIndicator status={status} />
      </div>

      <div className="space-y-4">
        <fieldset className="space-y-1.5">
          <label
            htmlFor="project-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Name
          </label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Project name"
          />
        </fieldset>

        <fieldset className="space-y-1.5">
          <label
            htmlFor="project-description"
            className="text-xs font-medium text-muted-foreground"
          >
            Description
          </label>
          <Textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="What is this project about?"
            rows={3}
          />
        </fieldset>

        <fieldset className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="space-y-1.5">
          <label
            htmlFor="project-notes"
            className="text-xs font-medium text-muted-foreground"
          >
            Notes / Metadata
          </label>
          <Textarea
            id="project-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Additional notes..."
            rows={4}
          />
        </fieldset>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-3 text-emerald-500" />
          <span className="text-emerald-500">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="size-3 text-destructive" />
          <span className="text-destructive">Error saving</span>
        </>
      )}
    </div>
  );
}
