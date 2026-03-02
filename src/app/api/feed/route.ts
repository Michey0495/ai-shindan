import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { DiagnosisResult, FeedItem } from "@/types";

export async function GET() {
  try {
    const ids = await kv.zrange("results:feed", 0, 19, { rev: true });

    if (!ids || ids.length === 0) {
      return NextResponse.json([]);
    }

    const items: FeedItem[] = [];
    for (const id of ids) {
      const result = await kv.get<DiagnosisResult>(`result:${id}`);
      if (result) {
        items.push({
          id: result.id,
          personalityType: result.personalityType,
          agentName: result.agentName,
          traits: result.traits,
          colorScheme: result.colorScheme,
          createdAt: result.createdAt,
        });
      }
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("Feed error:", err);
    return NextResponse.json(
      { error: "フィードの取得に失敗しました" },
      { status: 500 }
    );
  }
}
