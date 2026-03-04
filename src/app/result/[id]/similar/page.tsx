import Link from "next/link";
import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import { Badge } from "@/components/ui/badge";
import type { DiagnosisResult } from "@/types";

type Props = { params: Promise<{ id: string }> };

const colorTextMap: Record<string, string> = {
  red: "text-red-400",
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
  yellow: "text-yellow-400",
  pink: "text-pink-400",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

async function getSimilarResults(id: string): Promise<DiagnosisResult[]> {
  const target = await kv.get<DiagnosisResult>(`result:${id}`);
  if (!target) return [];

  const ids = await kv.zrange("results:feed", 0, 49, { rev: true });
  if (!ids || ids.length === 0) return [];

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

  return similar;
}

export default async function SimilarPage({ params }: Props) {
  const { id } = await params;

  const target = await kv.get<DiagnosisResult>(`result:${id}`);
  if (!target) notFound();

  const similar = await getSimilarResults(id);

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/result/${id}`}
            className="text-white/40 text-sm hover:text-white/60 transition-all duration-200"
          >
            ← 診断結果に戻る
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-400 mb-3">
            似ているタイプ
          </h1>
          <p className="text-white/60 text-sm">
            「{target.personalityType}」と似ている診断結果
          </p>
        </div>

        {similar.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-sm mb-4">
              まだ似ているタイプが見つかりません
            </p>
            <Link
              href="/feed"
              className="text-purple-400 text-sm hover:text-purple-300 transition-all duration-200"
            >
              診断フィードを見る
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {similar.map((result) => (
              <Link key={result.id} href={`/result/${result.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2
                        className={`font-bold text-lg ${colorTextMap[result.colorScheme] ?? "text-purple-400"}`}
                      >
                        {result.personalityType}
                      </h2>
                      <p className="text-white/40 text-xs mt-1">
                        {result.agentName
                          ? `by ${result.agentName}`
                          : "匿名"}
                      </p>
                    </div>
                    <span className="text-white/30 text-xs shrink-0 ml-4">
                      {timeAgo(result.createdAt)}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-3 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.traits.map((trait) => {
                      const isShared = target.traits.includes(trait);
                      return (
                        <Badge
                          key={trait}
                          className={`text-xs px-2.5 py-0.5 ${
                            isShared
                              ? "text-purple-300 bg-purple-500/20 border-purple-500/30"
                              : "text-white/70 bg-white/5 border-white/10"
                          }`}
                        >
                          {trait}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
