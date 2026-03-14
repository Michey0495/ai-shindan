import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FeedItem } from "@/types";
import { getTotalStats } from "@/lib/stats";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

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
    const res = await fetch(`${siteUrl}/api/feed`, { cache: "no-store" });
    if (!res.ok) return [];
    const items: FeedItem[] = await res.json();
    return items.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [recentItems, totals] = await Promise.all([
    getRecentItems(),
    getTotalStats(),
  ]);

  return (
    <main className="min-h-screen px-4 py-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-purple-400 text-xs font-bold tracking-[0.3em] mb-4">
          // AI SELF-ANALYSIS
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          AI 自己分析
        </h1>
        <p className="text-white/60 text-lg mb-2">
          あなたの本当の姿を、AIが可視化する
        </p>
        <p className="text-white/40 text-sm mb-10">
          プロフカード画像 / 能力値分析 / タイプ統計
        </p>

        {/* Two CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link href="/quiz" className="group">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer h-full">
              <p className="text-purple-400 text-xs font-bold tracking-widest mb-2">
                01 DEEP ANALYSIS
              </p>
              <p className="text-white font-bold text-lg mb-2">10問で深層分析</p>
              <p className="text-white/50 text-sm mb-4">
                10の質問に答えるだけ。AIが性格タイプ・能力値・二つ名を分析
              </p>
              <span className="inline-block bg-purple-500 text-white text-sm font-bold px-5 py-2 rounded-lg group-hover:bg-purple-400 transition-all duration-200">
                診断スタート
              </span>
            </div>
          </Link>

          <Link href="/create" className="group">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition-all duration-200 cursor-pointer h-full">
              <p className="text-sky-400 text-xs font-bold tracking-widest mb-2">
                02 QUICK CARD
              </p>
              <p className="text-white font-bold text-lg mb-2">30秒でプロフカード</p>
              <p className="text-white/50 text-sm mb-4">
                名前と趣味を入力するだけ。AIがプロフカードを即座に生成
              </p>
              <span className="inline-block bg-sky-500 text-white text-sm font-bold px-5 py-2 rounded-lg group-hover:bg-sky-400 transition-all duration-200">
                カードを作成
              </span>
            </div>
          </Link>
        </div>

        {/* Stats Banner */}
        {totals.totalResults > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 inline-flex gap-6 text-sm mb-10">
            <span className="text-white/60">
              <span className="text-white font-bold">{totals.totalResults}</span> 人が診断済み
            </span>
            <span className="text-white/20">|</span>
            <span className="text-white/60">
              <span className="text-white font-bold">{totals.uniqueTypes}</span> 種類のタイプ
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "01", title: "画像カード生成", desc: "結果をビジュアルカードとして画像保存" },
            { label: "02", title: "能力値分析", desc: "5つの指標で強みを可視化" },
            { label: "03", title: "タイプ統計", desc: "同じタイプの傾向をデータで確認" },
            { label: "04", title: "SNSシェア", desc: "OGP画像付きでワンタップ共有" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-purple-400 text-xs font-bold mb-1">{f.label}</p>
              <p className="text-white text-sm font-bold mb-1">{f.title}</p>
              <p className="text-white/40 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Results */}
      {recentItems.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-lg font-bold text-white">RECENT</h2>
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
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-white font-bold text-sm">
                        {item.personalityType}
                      </span>
                      {item.title && (
                        <span className="text-purple-400 text-xs ml-2">
                          {item.title}
                        </span>
                      )}
                    </div>
                    <span className="text-white/30 text-xs shrink-0 ml-4">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  {item.name && (
                    <p className="text-white/50 text-xs mb-1">{item.name}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {item.traits.slice(0, 3).map((trait) => (
                      <Badge
                        key={trait}
                        className="text-white/60 bg-white/5 border-white/10 text-xs px-2 py-0.5"
                      >
                        {trait}
                      </Badge>
                    ))}
                    {item.agentName && (
                      <span className="text-white/30 text-xs ml-auto">
                        by {item.agentName}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-white/30 text-xs">登録不要・無料・何度でもOK</p>
      </div>
    </main>
  );
}
