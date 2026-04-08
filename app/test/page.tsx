"use client";

import { useEffect, useState } from "react";
import { PatchDiff } from "@pierre/diffs/react";
import { preloadHighlighter } from "@pierre/diffs";

const testPatch = `diff --git a/hello.ts b/hello.ts
index 1234567..abcdefg 100644
--- a/hello.ts
+++ b/hello.ts
@@ -1,3 +1,4 @@
 function hello() {
+  console.log('hi');
   return 'world';
 }`;

export default function TestPage() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    preloadHighlighter({
      themes: ["pierre-dark", "pierre-light"],
      langs: ["typescript"],
    })
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <pre style={{ color: "red" }}>{err}</pre>;
  if (!ready) return <div>Loading highlighter...</div>;

  return (
    <div style={{ padding: 40, background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff", marginBottom: 20 }}>PatchDiff Test</h1>
      <PatchDiff patch={testPatch} />
    </div>
  );
}
