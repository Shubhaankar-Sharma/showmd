import { NextResponse } from "next/server";
import { getShowMeta, getShowContent, updateShow, deleteShow } from "@/lib/storage";
import type { UpdateShowRequest } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [meta, content] = await Promise.all([
    getShowMeta(id),
    getShowContent(id),
  ]);

  if (!meta || content === null) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ...meta, content });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as UpdateShowRequest;

  const updated = await updateShow(id, body);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ id, updatedAt: updated.updatedAt });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteShow(id);
  return NextResponse.json({ id, deleted: true });
}
