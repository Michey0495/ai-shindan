import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { DiagnosisResult } from "@/types";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const target = await kv.get<DiagnosisResult>(`result:${id}`);

    if (!target) {
      return NextResponse.json(
        { error: "診断結果が見つかりません" },
        { status: 404 }
      );
    }

    const ids = await kv.zrange("results:feed", 0, 49, { rev: true });

    if (!ids || ids.length === 0) {
      return NextResponse.json([]);
    }

    const similar: DiagnosisResult[] = [];
    for (const feedId of ids) {
      if (feedId === id) continue;

      const result = await kv.get<DiagnosisResult>(`result:${feedId}`);
      if (!result) continue;

      const sameType = result.personalityType === target.personalityType;
      const overlappingTraits = result.traits.filter((t) =>
        target.traits.includes(t)
      );

      if (sameType || overlappingTraits.length >= 2) {
        similar.push(result);
      }

      if (similar.length >= 10) break;
    }

    return NextResponse.json(similar);
  } catch (err) {
    console.error("Similar error:", err);
    return NextResponse.json(
      { error: "類似結果の取得に失敗しました" },
      { status: 500 }
    );
  }
}
