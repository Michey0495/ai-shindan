import { NextRequest, NextResponse } from "next/server";
import type { DiagnosisResult } from "@/types";

export async function GET(request: NextRequest) {
  try {
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ items: [], nextCursor: null });
    }
    const { kv } = await import("@vercel/kv");
    const { searchParams } = request.nextUrl;
    const cursor = parseInt(searchParams.get("cursor") || "0", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const sort = searchParams.get("sort") || "new";

    const feedKey = sort === "popular" ? "shindan:popular" : "results:feed";
    const ids = await kv.zrange(feedKey, cursor, cursor + limit, { rev: true });

    if (!ids || ids.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    const likeKeys = ids.map((id) => `likes:shindan:${id}`);
    const likeCounts = await kv.mget<(number | null)[]>(...likeKeys);

    const items = [];
    for (let i = 0; i < ids.length; i++) {
      const result = await kv.get<DiagnosisResult>(`result:${ids[i]}`);
      if (result) {
        items.push({
          id: result.id,
          personalityType: result.personalityType,
          agentName: result.agentName,
          traits: result.traits,
          colorScheme: result.colorScheme,
          createdAt: result.createdAt,
          likes: likeCounts[i] ?? 0,
        });
      }
    }

    const nextCursor = ids.length === limit + 1 ? cursor + limit : null;

    return NextResponse.json({ items, nextCursor });
  } catch (err) {
    console.error("Feed error:", err);
    return NextResponse.json({ items: [], nextCursor: null });
  }
}
