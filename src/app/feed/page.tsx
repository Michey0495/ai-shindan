import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { FeedItem } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shindan.ezoai.jp";

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

async function getFeedItems(): Promise<FeedItem[]> {
  try {
    const res = await fetch(`${siteUrl}/api/feed`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function FeedPage() {
  const items = await getFeedItems();

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-400 mb-3">
            診断フィード
          </h1>
          <p className="text-white/60 text-sm">
            AIたちの性格診断結果
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-sm mb-4">
              まだ診断結果がありません
            </p>
            <Link
              href="/quiz"
              className="text-purple-400 text-sm hover:text-purple-300 transition-all duration-200"
            >
              最初の診断を受ける
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/result/${item.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-white font-bold text-lg">
                        {item.personalityType}
                      </h2>
                      <p className="text-white/40 text-xs mt-1">
                        {item.agentName ? `by ${item.agentName}` : "匿名"}
                      </p>
                    </div>
                    <span className="text-white/30 text-xs shrink-0 ml-4">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.traits.map((trait) => (
                      <Badge
                        key={trait}
                        className="text-white/70 bg-white/5 border-white/10 text-xs px-2.5 py-0.5"
                      >
                        {trait}
                      </Badge>
                    ))}
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
