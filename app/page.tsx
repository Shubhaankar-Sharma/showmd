export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1 className="text-lg font-semibold font-mono">showmd</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 flex-1">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Interactive Technical Walkthroughs
            </h2>
            <p className="mt-3 text-muted text-lg leading-relaxed max-w-2xl">
              Create rich, shareable technical explainers with MDX. Code diffs
              with annotations, mermaid diagrams, animations, and interactive
              components — all on a single link.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-12">
            <Feature
              title="Code Diffs"
              desc="Walk through code changes with annotated diffs. CLI handles git — zero token waste."
            />
            <Feature
              title="Mermaid Diagrams"
              desc="Flowcharts, sequence diagrams, ER diagrams — rendered live from mermaid source."
            />
            <Feature
              title="Rich MDX"
              desc="Callouts, tabs, accordions, steps, file trees, scroll animations — all built in."
            />
          </div>

          <div className="mt-16 rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Quick Start
            </h3>
            <pre className="text-sm text-foreground/70 font-mono leading-relaxed overflow-x-auto">
{`# Write your walkthrough
cat > show.mdx << 'EOF'
# My Technical Walkthrough

<Mermaid chart={\`
graph TD
    A[Client] --> B[Server]
    B --> C[Database]
\`} />

<CodeDiff id="main-change" />

<Callout type="info" title="Key Insight">
  This is the important part.
</Callout>
EOF

# Push with code diffs
npm run showmd -- push \\
  --title "My Walkthrough" \\
  --diff main-change:src/index.ts:HEAD~1..HEAD \\
  --annotate main-change:5:"This line matters" \\
  --content show.mdx

# → Created: http://localhost:3000/s/abc123`}
            </pre>
          </div>

          <div className="mt-12 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">API</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-4 py-2 font-medium text-muted">
                      Route
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-muted">
                      Method
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-muted">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  <Row route="/api/shows" method="POST" desc="Create a show" />
                  <Row route="/api/shows/:id" method="GET" desc="Get show data" />
                  <Row route="/api/shows/:id" method="PUT" desc="Update show" />
                  <Row route="/api/shows/:id" method="DELETE" desc="Delete show" />
                  <Row route="/api/shows/:id/diffs/:name" method="GET" desc="Get diff data" />
                  <Row route="/agents" method="GET" desc="Agent skill doc" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-muted">
          showmd — interactive technical walkthroughs
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Row({
  route,
  method,
  desc,
}: {
  route: string;
  method: string;
  desc: string;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-2 text-foreground/70">{route}</td>
      <td className="px-4 py-2">
        <span className="text-accent">{method}</span>
      </td>
      <td className="px-4 py-2 text-muted font-sans">{desc}</td>
    </tr>
  );
}
