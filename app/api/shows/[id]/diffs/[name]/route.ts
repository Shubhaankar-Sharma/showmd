import { NextResponse } from "next/server";
import { getDiff } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; name: string }> }
) {
  const { id, name } = await params;
  const diff = await getDiff(id, name);

  if (!diff) {
    return NextResponse.json({ error: "diff not found" }, { status: 404 });
  }

  return NextResponse.json(diff);
}
