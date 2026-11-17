// THROWAWAY dev-only route: saves exported carousel PNGs to design/mascot-carousels. Delete after review.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "dev only" }, { status: 404 });
  const { carousel, fileName, dataUrl } = (await request.json()) as { carousel: string; fileName: string; dataUrl: string };
  if (!/^[a-z0-9-]+$/.test(carousel) || !/^[a-z0-9-]+\.png$/.test(fileName)) return NextResponse.json({ error: "bad name" }, { status: 400 });
  const dir = path.join(process.cwd(), "design", "mascot-carousels", carousel);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(dataUrl.split(",")[1] ?? "", "base64"));
  return NextResponse.json({ ok: true });
}
