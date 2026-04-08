interface TreeNode {
  name: string;
  annotation?: string;
  children: TreeNode[];
  isDir: boolean;
}

function parseTree(text: string): TreeNode[] {
  const lines = text
    .split("\n")
    .filter((l) => l.trim().length > 0);

  const root: TreeNode[] = [];
  const stack: { indent: number; children: TreeNode[] }[] = [
    { indent: -1, children: root },
  ];

  for (const line of lines) {
    const stripped = line.replace(/^[\s-]*/, "");
    const indent = line.length - line.trimStart().length;
    const isDir = stripped.endsWith("/");
    const match = stripped.match(/^(.+?)(?:\s+\((.+)\))?$/);
    const name = match ? match[1] : stripped;
    const annotation = match ? match[2] : undefined;

    const node: TreeNode = {
      name: isDir ? name : name,
      annotation,
      children: [],
      isDir,
    };

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    if (isDir) {
      stack.push({ indent, children: node.children });
    }
  }

  return root;
}

function TreeItem({
  node,
  depth,
}: {
  node: TreeNode;
  depth: number;
}) {
  return (
    <>
      <div
        className="flex items-center gap-1.5 py-0.5 text-sm font-mono"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <span className="text-muted">
          {node.isDir ? "📁" : "📄"}
        </span>
        <span className={node.isDir ? "text-foreground" : "text-foreground/80"}>
          {node.name}
        </span>
        {node.annotation && (
          <span className="text-xs text-accent ml-1">({node.annotation})</span>
        )}
      </div>
      {node.children.map((child, i) => (
        <TreeItem key={i} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

export default function FileTree({ children }: { children: React.ReactNode }) {
  const text = extractText(children);
  const tree = parseTree(text);

  return (
    <div className="my-4 rounded-lg border border-border bg-surface p-4 not-prose">
      {tree.map((node, i) => (
        <TreeItem key={i} node={node} depth={0} />
      ))}
    </div>
  );
}
