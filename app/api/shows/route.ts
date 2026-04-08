import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveShow } from "@/lib/storage";
import type { CreateShowRequest } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as CreateShowRequest;

  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const id = nanoid(10);
  const now = new Date().toISOString();

  await saveShow(
    id,
    {
      title: body.title,
      description: body.description,
      createdAt: now,
      updatedAt: now,
    },
    body.content,
    body.diffs
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return NextResponse.json({
    id,
    url: `${baseUrl}/s/${id}`,
    createdAt: now,
  });
}
