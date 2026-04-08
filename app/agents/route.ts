import { NextResponse } from "next/server";

const skillDoc = `---
name: showmd
description: Create interactive technical walkthroughs with MDX, code diffs, mermaid diagrams, and animations.
---

# showmd

Create rich, interactive technical walkthroughs on a shareable link. Write MDX with built-in components — code diffs, mermaid diagrams, animations, callouts, tabs, and more.

## Quick Start

### Using the CLI (recommended)

\`\`\`bash
# 1. Write your MDX content
cat > walkthrough.mdx << 'EOF'
# How Our Auth System Works

Let me walk through the JWT + session hybrid approach we use.

<Mermaid chart={\`
graph TD
    A[Client] --> B[API Gateway]
    B --> C{Valid JWT?}
    C -->|Yes| D[Check Session Store]
    C -->|No| E[401 Unauthorized]
    D -->|Active| F[Allow Request]
    D -->|Revoked| E
\`} />

## The Key Change

<CodeDiff id="auth-change" />

<Callout type="info" title="Why both JWT and sessions?">
  JWTs are stateless but can't be revoked. Sessions can be revoked but require a DB lookup.
  We combine both: JWT for fast verification, session store for revocation checks.
</Callout>
EOF

# 2. Push with diffs
npm run showmd -- push \\
  --title "How Our Auth System Works" \\
  --diff auth-change:src/auth.ts:main~3..main \\
  --annotate auth-change:12:"This revocation check is the key addition" \\
  --content walkthrough.mdx
\`\`\`

### Using the API directly

\`\`\`bash
curl -X POST http://localhost:3000/api/shows \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Walkthrough",
    "content": "# Hello\\n\\nThis is a **showmd** walkthrough."
  }'
\`\`\`

## CLI Reference

\`\`\`
showmd push [options]

Options:
  --content <file>      Path to MDX content file (required)
  --title <title>       Show title (required for new shows)
  --description <desc>  Show description
  --id <id>             Existing show ID (for updates)
  --diff <spec>         Diff spec: name:file:refrange[:linerange] (repeatable)
  --annotate <spec>     Annotation: name:line:comment (repeatable)
  --base-url <url>      Server URL (default: http://localhost:3000)
\`\`\`

### --diff format

\`name:file:refrange[:linerange]\`

- \`auth:src/auth.ts:main~3..main\` → runs \`git diff main~3..main -- src/auth.ts\`
- \`fix:lib/db.ts:HEAD~1..HEAD:10-50\` → same but trims to lines 10–50
- \`feature:src/api.ts:abc123..def456\` → diff between two commits

### --annotate format

\`name:line:comment\`

- \`auth:12:This is the key change\` → annotation on line 12 of the "auth" diff

## API Reference

| Route | Method | Body | Returns |
|---|---|---|---|
| \`/api/shows\` | POST | \`{ title, content, diffs? }\` | \`{ id, url }\` |
| \`/api/shows/:id\` | GET | — | \`{ id, title, content, ... }\` |
| \`/api/shows/:id\` | PUT | \`{ title?, content?, diffs? }\` | \`{ id, updatedAt }\` |
| \`/api/shows/:id\` | DELETE | — | \`{ deleted: true }\` |
| \`/api/shows/:id/diffs/:name\` | GET | — | diff data JSON |

## MDX Component Reference

### \`<Mermaid>\` — Diagrams

Renders mermaid.js diagrams. Supports all mermaid diagram types: flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, etc.

\`\`\`mdx
<Mermaid chart={\`
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
\`} caption="Data flow overview" />
\`\`\`

\`\`\`mdx
<Mermaid chart={\`
sequenceDiagram
    Client->>+API: POST /login
    API->>+Auth: Validate credentials
    Auth-->>-API: JWT token
    API-->>-Client: 200 OK + token
\`} />
\`\`\`

### \`<CodeDiff>\` — Code Walkthroughs

References a named diff uploaded via CLI. The diff data (patch, annotations) is stored separately — never in the MDX.

\`\`\`mdx
<CodeDiff id="auth-change" />
\`\`\`

Pair with CLI:
\`\`\`bash
--diff auth-change:src/auth.ts:main~3..main
--annotate auth-change:12:"Revocation check before JWT verify"
\`\`\`

### \`<CodeBlock>\` — Code Display

Syntax-highlighted code with filename header and copy button.

\`\`\`mdx
<CodeBlock filename="src/auth.ts" lang="typescript" highlight={[3, 4]}>
{\`function authenticate(token: string) {
  const decoded = jwt.verify(token, SECRET);
  if (await isRevoked(decoded.jti)) throw new AuthError("revoked");
  return decoded;
}\`}
</CodeBlock>
\`\`\`

Props:
- \`filename?\` — shown in header
- \`lang?\` — language for highlighting
- \`highlight?\` — array of 1-based line numbers to highlight

### \`<Callout>\` — Callout Boxes

\`\`\`mdx
<Callout type="info" title="Good to know">
  This pattern is used across all our microservices.
</Callout>

<Callout type="warning" title="Breaking Change">
  This migration requires downtime.
</Callout>

<Callout type="error" title="Critical">
  Do NOT deploy without running the migration first.
</Callout>

<Callout type="success" title="Result">
  Auth latency dropped from 45ms to 12ms.
</Callout>

<Callout type="note">
  See the RFC for full context.
</Callout>
\`\`\`

Types: \`info\`, \`warning\`, \`error\`, \`success\`, \`note\`

### \`<Steps>\` — Step-by-Step Walkthrough

\`\`\`mdx
<Steps>
  <Steps.Step title="Client sends JWT" step={1}>
    The API gateway extracts the Bearer token from the Authorization header.
  </Steps.Step>
  <Steps.Step title="Verify signature" step={2}>
    JWT signature is checked against the public key.
  </Steps.Step>
  <Steps.Step title="Check revocation" step={3}>
    Session store (Redis) is queried for the token's JTI.
  </Steps.Step>
</Steps>
\`\`\`

### \`<FileTree>\` — Directory Visualization

\`\`\`mdx
<FileTree>
  src/
    auth/
      jwt.ts
      session.ts (modified)
      middleware.ts (new)
    api/
      routes.ts
  tests/
    auth.test.ts (new)
</FileTree>
\`\`\`

Annotations in parentheses are highlighted.

### \`<Tabs>\` / \`<Tab>\` — Tabbed Content

\`\`\`mdx
<Tabs>
  <Tab label="Before">
    Old implementation that only checks JWT:

    <CodeBlock lang="typescript">
    {\`function auth(req) {
      return jwt.verify(req.token, SECRET);
    }\`}
    </CodeBlock>
  </Tab>
  <Tab label="After">
    New implementation with revocation check:

    <CodeBlock lang="typescript">
    {\`async function auth(req) {
      const decoded = jwt.verify(req.token, SECRET);
      if (await isRevoked(decoded.jti)) throw new Error("revoked");
      return decoded;
    }\`}
    </CodeBlock>
  </Tab>
</Tabs>
\`\`\`

### \`<Accordion>\` / \`<AccordionItem>\` — Expandable Sections

\`\`\`mdx
<Accordion>
  <AccordionItem title="Why not use opaque tokens?">
    Opaque tokens require a database lookup on every request. With JWTs,
    we only hit Redis for the revocation check — and that's a simple key lookup.
  </AccordionItem>
  <AccordionItem title="What about token rotation?">
    We use short-lived JWTs (15 min) with refresh tokens stored in httpOnly cookies.
  </AccordionItem>
</Accordion>
\`\`\`

### \`<FadeIn>\` — Scroll Animations

Wraps content in a scroll-triggered fade-in animation.

\`\`\`mdx
<FadeIn direction="up" delay={0.2}>

## The Key Insight

By combining JWTs with a session revocation check, we get the best of both worlds.

</FadeIn>
\`\`\`

Props:
- \`direction?\` — \`"up"\`, \`"down"\`, \`"left"\`, \`"right"\` (default: \`"up"\`)
- \`delay?\` — seconds (default: \`0\`)

### \`<Highlight>\` — Inline Highlighting

\`\`\`mdx
The <Highlight color="green">session check</Highlight> is the critical addition.
\`\`\`

Colors: \`red\`, \`green\`, \`blue\`, \`yellow\`, \`purple\`, \`cyan\`

### \`<Badge>\` — Colored Pills

\`\`\`mdx
<Badge color="green">New in v2.1</Badge>
<Badge color="yellow">Experimental</Badge>
<Badge color="red">Deprecated</Badge>
\`\`\`

Colors: \`red\`, \`green\`, \`blue\`, \`yellow\`, \`purple\`, \`gray\`

## Authoring Tips

- **Use headings** (\`##\` and \`###\`) to create clear sections
- **Start with a Mermaid diagram** to set the high-level context
- **Use Steps** for sequential walkthroughs
- **Use CodeDiff** for before/after comparisons — never paste diffs into MDX
- **Use Callout** for important notes, warnings, and results
- **Use Tabs** to show alternative approaches or before/after
- **Use FadeIn** sparingly for visual polish on key sections
- Content is a **single scrollable page**, not slides — write naturally

## Workflow

1. Write MDX content with component references
2. \`showmd push --title "..." --content file.mdx --diff ...\` to create
3. Share the URL
4. \`showmd push --id <id> --content updated.mdx\` to update live
`;

export async function GET() {
  return new NextResponse(skillDoc, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
