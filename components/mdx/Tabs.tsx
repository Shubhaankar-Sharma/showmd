"use client";

import { useState, Children, isValidElement, type ReactNode } from "react";

export function Tab({
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return <>{children}</>;
}

export default function Tabs({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);

  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.type === Tab || (child.props as { label?: string }).label)
  );

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden not-prose">
      <div className="flex border-b border-border bg-surface">
        {tabs.map((tab, i) => {
          const label =
            isValidElement(tab) ? (tab.props as { label: string }).label : `Tab ${i + 1}`;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 text-sm transition-colors ${
                i === active
                  ? "text-foreground border-b-2 border-accent -mb-px"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="p-4 text-sm leading-relaxed">
        {tabs[active]}
      </div>
    </div>
  );
}
