import type { MDXComponents } from "mdx/types";
import type { ReactElement, ReactNode } from "react";
import Mermaid from "./Mermaid";
import CodeDiff from "./CodeDiff";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";
import Steps from "./Steps";
import FileTree from "./FileTree";
import Tabs, { Tab } from "./Tabs";
import Accordion, { AccordionItem } from "./Accordion";
import FadeIn from "./FadeIn";
import Highlight from "./Highlight";
import Badge from "./Badge";

// Intercept ```mermaid fenced blocks and render via Mermaid component
function Code({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & React.ComponentProps<"code">) {
  // Only intercept fenced code blocks (inside <pre>), not inline code
  // MDX renders fenced blocks as <pre><code className="language-xxx">
  const text = typeof children === "string" ? children : "";
  if (className && className.includes("language-mermaid")) {
    return <Mermaid chart={text} /> as unknown as ReactElement;
  }
  if (className && className.includes("language-filetree")) {
    return <FileTree>{text}</FileTree> as unknown as ReactElement;
  }
  return <code className={className} {...props}>{children}</code>;
}

export const mdxComponents: MDXComponents = {
  Mermaid,
  CodeDiff,
  CodeBlock,
  Callout,
  Steps,
  "Steps.Step": Steps.Step,
  FileTree,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  FadeIn,
  Highlight,
  Badge,
  code: Code,
};
