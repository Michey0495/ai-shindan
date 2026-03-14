import { NextResponse } from "next/server";
import type { AnalysisResult, FeedItem } from "@/types";

export async function GET() {
  try {
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json([]);
    }

    const { kv } = await import("@vercel/kv");
    const ids = await kv.zrange("results:feed", 0, 19, { rev: true });

    if (!ids || ids.length === 0) {
      return NextResponse.json([]);
    }

    const items: FeedItem[] = [];
    for (const id of ids) {
      const result = await kv.get<AnalysisResult>(`result:${id}`);
      if (result) {
        items.push({
          id: result.id,
          personalityType: result.personalityType,
          title: result.title,
          name: result.name,
          agentName: result.agentName,
          traits: result.traits,
          stats: result.stats,
          colorScheme: result.colorScheme,
          createdAt: result.createdAt,
        });
      }
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("Feed error:", err);
    return NextResponse.json([]);
  }
}
