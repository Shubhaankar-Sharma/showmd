import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getShowMeta, getShowContent } from "@/lib/storage";
import { mdxComponents } from "@/components/mdx";
import { ShowProvider } from "@/components/mdx/ShowContext";
import remarkGfm from "remark-gfm";

export const dynamic = "force-dynamic";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [meta, content] = await Promise.all([
    getShowMeta(id),
    getShowContent(id),
  ]);

  if (!meta || content === null) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center gap-3">
          <span className="text-xs font-mono text-muted">showmd</span>
          <span className="text-border">/</span>
          <h1 className="text-sm font-medium text-foreground truncate">
            {meta.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <article className="prose prose-invert max-w-none">
          <ShowProvider showId={id}>
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </ShowProvider>
        </article>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-muted">
          Last updated {new Date(meta.updatedAt).toLocaleString()}
        </div>
      </footer>
    </div>
  );
}
