"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown } from "lucide-react";
import type { TranscriptSummaryData } from "@/types";

interface TranscriptTableProps {
  transcripts: TranscriptSummaryData[];
}

export function TranscriptTable({ transcripts }: TranscriptTableProps) {
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...transcripts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  function truncate(text: string, maxLen = 100): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + "...";
  }

  if (transcripts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No transcripts yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Date
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((transcript) => (
          <TableRow key={transcript.id}>
            <TableCell className="text-muted-foreground">
              {format(new Date(transcript.date), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="font-medium">{transcript.title}</TableCell>
            <TableCell className="max-w-[300px]">
              {transcript.summary.length > 100 ? (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="cursor-default">
                      {truncate(transcript.summary)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    {transcript.summary}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span>{transcript.summary}</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {transcript.participants.map((p) => (
                  <Badge key={p} variant="secondary" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="outline" className="text-[10px]">
                {transcript.actionItems.length} items
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
