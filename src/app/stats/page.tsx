import type { Metadata } from "next";
import type { TypeStats } from "@/types";
import { getOrComputeStats, getTotalStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "タイプ統計 - AI自己分析",
  description: "AI自己分析の性格タイプ統計データ。同じタイプの人数、平均能力値、よくある特徴を確認できます。",
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [stats, totals] = await Promise.all([
    getOrComputeStats(),
    getTotalStats(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-purple-400 text-xs font-bold tracking-widest mb-2">
          TYPE STATISTICS
        </p>
        <h1 className="text-2xl font-black text-white mb-2">タイプ統計</h1>
        <p className="text-white/50 text-sm">
          診断データから見る性格タイプの分布と傾向
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-white">{totals.totalResults}</p>
          <p className="text-white/40 text-xs mt-1">診断数</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-white">{totals.uniqueTypes}</p>
          <p className="text-white/40 text-xs mt-1">タイプ数</p>
        </div>
      </div>

      {/* Type Distribution */}
      {stats.length > 0 ? (
        <div className="space-y-3">
          {stats.slice(0, 20).map((stat: TypeStats) => (
            <div
              key={stat.type}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold text-sm">
                  {stat.type}
                </span>
                <span className="text-white/40 text-xs">
                  {stat.count}人 ({stat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="bg-purple-400 h-2 rounded-full"
                  style={{ width: `${Math.min(stat.percentage * 3, 100)}%` }}
                />
              </div>
              {stat.commonTraits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {stat.commonTraits.map((trait) => (
                    <span
                      key={trait}
                      className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/40 text-sm">
            まだ統計データがありません。診断結果が蓄積されると表示されます。
          </p>
        </div>
      )}
    </div>
  );
}
