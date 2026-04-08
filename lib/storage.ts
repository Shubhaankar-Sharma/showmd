import { uploadToR2, getFromR2, deletePrefixFromR2 } from "./r2";
import type { ShowMeta, DiffData } from "./types";

const metaKey = (id: string) => `shows/${id}/_meta.json`;
const contentKey = (id: string) => `shows/${id}/content.mdx`;
const diffKey = (id: string, name: string) => `shows/${id}/diffs/${name}.json`;

export async function saveShow(
  id: string,
  meta: Omit<ShowMeta, "id">,
  content: string,
  diffs?: Record<string, DiffData>
): Promise<void> {
  const show: ShowMeta = { id, ...meta };
  await Promise.all([
    uploadToR2(metaKey(id), JSON.stringify(show), "application/json"),
    uploadToR2(contentKey(id), content, "text/mdx"),
    ...(diffs
      ? Object.entries(diffs).map(([name, data]) =>
          uploadToR2(diffKey(id, name), JSON.stringify(data), "application/json")
        )
      : []),
  ]);
}

export async function getShowMeta(id: string): Promise<ShowMeta | null> {
  const raw = await getFromR2(metaKey(id));
  if (!raw) return null;
  return JSON.parse(raw) as ShowMeta;
}

export async function getShowContent(id: string): Promise<string | null> {
  return getFromR2(contentKey(id));
}

export async function getDiff(id: string, name: string): Promise<DiffData | null> {
  const raw = await getFromR2(diffKey(id, name));
  if (!raw) return null;
  return JSON.parse(raw) as DiffData;
}

export async function updateShow(
  id: string,
  updates: { title?: string; description?: string; content?: string; diffs?: Record<string, DiffData> }
): Promise<ShowMeta | null> {
  const meta = await getShowMeta(id);
  if (!meta) return null;

  const now = new Date().toISOString();
  const updated: ShowMeta = {
    ...meta,
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description }),
    updatedAt: now,
  };

  const uploads: Promise<void>[] = [
    uploadToR2(metaKey(id), JSON.stringify(updated), "application/json"),
  ];

  if (updates.content !== undefined) {
    uploads.push(uploadToR2(contentKey(id), updates.content, "text/mdx"));
  }

  if (updates.diffs) {
    for (const [name, data] of Object.entries(updates.diffs)) {
      uploads.push(uploadToR2(diffKey(id, name), JSON.stringify(data), "application/json"));
    }
  }

  await Promise.all(uploads);
  return updated;
}

export async function deleteShow(id: string): Promise<void> {
  await deletePrefixFromR2(`shows/${id}/`);
}
