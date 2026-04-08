"use client";

import { useEffect, useRef, useState } from "react";

let mermaidImport: Promise<typeof import("mermaid")> | null = null;
function getMermaid() {
  if (!mermaidImport) {
    mermaidImport = import("mermaid").then((mod) => {
      mod.default.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "#111",
          primaryColor: "#3b82f6",
          primaryTextColor: "#ededed",
          lineColor: "#444",
          secondaryColor: "#1e293b",
          tertiaryColor: "#1a1a2e",
        },
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      });
      return mod;
    });
  }
  return mermaidImport;
}

let counter = 0;

export default function Mermaid({
  chart,
  children,
  caption,
}: {
  chart?: string;
  children?: string;
  caption?: string;
}) {
  // Support both chart prop and children (children works better in MDX)
  const source = chart || (typeof children === "string" ? children : "");
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const idRef = useRef(`mermaid-${counter++}`);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    getMermaid().then(async (mod) => {
      if (cancelled) return;
      try {
        const { svg: rendered } = await mod.default.render(
          idRef.current,
          source.trim()
        );
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <div className="mermaid-container">
      <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <div className="mermaid-caption">{caption}</div>}
    </div>
  );
}
