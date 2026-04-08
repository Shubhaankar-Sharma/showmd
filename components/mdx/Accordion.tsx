"use client";

import { useState, type ReactNode } from "react";

export function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-surface/50 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-foreground/70 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Accordion({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden not-prose">
      {children}
    </div>
  );
}
