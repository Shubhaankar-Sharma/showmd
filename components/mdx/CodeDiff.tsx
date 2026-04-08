"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useShowId } from "./ShowContext";
import { PatchDiff, type DiffLineAnnotation } from "@pierre/diffs/react";
import { preloadHighlighter } from "@pierre/diffs";

interface DiffAnnotation {
  line: number;
  content: string;
  side?: "additions" | "deletions";
}

interface DiffData {
  patch: string;
  filename?: string;
  annotations?: DiffAnnotation[];
}

let highlighterReady: Promise<void> | null = null;
function ensureHighlighter() {
  if (!highlighterReady) {
    highlighterReady = preloadHighlighter({
      themes: ["github-dark"],
      langs: ["typescript", "javascript", "tsx", "jsx", "json", "css", "html", "bash", "markdown", "python", "go", "rust"],
    });
  }
  return highlighterReady;
}

export default function CodeDiff({ id }: { id: string }) {
  const showId = useShowId();
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showId) return;
    Promise.all([
      fetch(`/api/shows/${showId}/diffs/${id}`)
        .then((r) => {
          if (!r.ok) throw new Error("Diff not found");
          return r.json();
        }),
      ensureHighlighter(),
    ])
      .then(([diffData]) => {
        setDiff(diffData);
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, [id, showId]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
        Failed to load diff &quot;{id}&quot;: {error}
      </div>
    );
  }

  if (!diff || !ready) {
    return (
      <div className="my-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-muted text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-accent" />
          Loading diff...
        </div>
      </div>
    );
  }

  const lineAnnotations: DiffLineAnnotation<string>[] = (
    diff.annotations || []
  ).map((a) => ({
    lineNumber: a.line,
    side: a.side === "deletions" ? ("old" as const) : ("new" as const),
    data: a.content,
  }));

  return (
    <div className="my-6 overflow-hidden not-prose" style={{ width: "100%", maxWidth: "100vw" }}>
      <PatchDiff
        patch={diff.patch}
        style={{ width: "100%" }}
      />
    </div>
  );
}
