"use client";

import { useState } from "react";

export default function CodeBlock({
  children,
  filename,
  lang,
  highlight,
}: {
  children: string;
  filename?: string;
  lang?: string;
  highlight?: number[];
}) {
  const [copied, setCopied] = useState(false);
  const code = typeof children === "string" ? children : "";
  const highlightSet = new Set(highlight || []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden not-prose">
      {(filename || lang) && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-xs font-mono text-muted">{filename}</span>
            )}
            {lang && !filename && (
              <span className="text-xs font-mono text-muted">{lang}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-[#0a0a0a]">
        <code>
          {code.split("\n").map((line, i) => (
            <div
              key={i}
              className={`${
                highlightSet.has(i + 1)
                  ? "bg-accent/10 -mx-4 px-4 border-l-2 border-accent"
                  : ""
              }`}
            >
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
