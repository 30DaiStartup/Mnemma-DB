"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Failed to load project</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load this project. It may have been removed or there
        was a server error.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
