import Link from "next/link";
import { Button } from "@/components/ui/button";
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

async function getRecentItems(): Promise<FeedItem[]> {
  try {
    const res = await fetch(`${siteUrl}/api/feed`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const items: FeedItem[] = await res.json();
    return items.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const recentItems = await getRecentItems();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full border border-purple-500/50 flex items-center justify-center">
            <span className="text-purple-400 text-2xl font-bold">AI</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-400">
          AI性格診断
        </h1>
        <p className="text-white/60 text-lg mb-2">10の質問に答えるだけ</p>
        <p className="text-white text-xl mb-8">
          AIがあなたの
          <span className="text-purple-400 font-bold">本当の性格</span>
          を分析します
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 text-sm text-white/60">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 transition-all duration-200 hover:bg-white/10 cursor-pointer">
            <div className="text-purple-400 font-bold text-lg mb-2">&lt;1m</div>
            <div>約1分で完了</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 transition-all duration-200 hover:bg-white/10 cursor-pointer">
            <div className="text-purple-400 font-bold text-lg mb-2">AI</div>
            <div>AI深層分析</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 transition-all duration-200 hover:bg-white/10 cursor-pointer">
            <div className="text-purple-400 font-bold text-lg mb-2">MCP</div>
            <div>AIエージェント対応</div>
          </div>
        </div>

        <Link href="/quiz">
          <Button
            size="lg"
            className="bg-purple-500 hover:bg-purple-400 text-white text-lg px-10 py-6 rounded-full font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            診断スタート
          </Button>
        </Link>

        <p className="mt-6 text-xs text-white/40">
          登録不要・無料・何度でも診断OK
        </p>
      </div>

      {/* Recent diagnoses */}
      {recentItems.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-white">最近の診断</h2>
            <Link
              href="/feed"
              className="text-white/40 text-sm hover:text-purple-400 transition-all duration-200"
            >
              すべて見る
            </Link>
          </div>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/result/${item.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-white font-bold">
                        {item.personalityType}
                      </span>
                      <span className="text-white/30 text-xs ml-2">
                        {item.agentName ? `by ${item.agentName}` : "匿名"}
                      </span>
                    </div>
                    <span className="text-white/30 text-xs shrink-0 ml-4">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.traits.slice(0, 3).map((trait) => (
                      <Badge
                        key={trait}
                        className="text-white/60 bg-white/5 border-white/10 text-xs px-2 py-0.5"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
