import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProfileWithResults } from "@/lib/profile";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getProfileWithResults(id);
  if (!data) return { title: "プロフィール - AI自己分析" };

  const name = data.profile.name ?? "ユーザー";
  return {
    title: `${name}の分析履歴 - AI自己分析`,
    description: `${name}のAI自己分析履歴（${data.results.length}件）`,
  };
}

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

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const data = await getProfileWithResults(id);

  if (!data) {
    notFound();
  }

  const { profile, results } = data;
  const name = profile.name ?? "ユーザー";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-purple-400 text-xs font-bold tracking-widest mb-2">
          PROFILE
        </p>
        <h1 className="text-2xl font-black text-white mb-2">{name}</h1>
        <p className="text-white/50 text-sm">
          {results.length}件の分析結果
        </p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-3">
          {results
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((result) => (
              <Link key={result.id} href={`/result/${result.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-white font-bold text-sm">
                        {result.personalityType}
                      </span>
                      {result.title && (
                        <span className="text-purple-400 text-xs ml-2">
                          {result.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-white/20 text-xs">
                        {result.mode === "quiz" ? "診断" : "作成"}
                      </span>
                      <span className="text-white/30 text-xs">
                        {timeAgo(result.createdAt)}
                      </span>
                    </div>
                  </div>
                  {result.catchcopy && (
                    <p className="text-white/50 text-xs mb-2">
                      {result.catchcopy}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {result.traits.slice(0, 3).map((trait) => (
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
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/40 text-sm">まだ分析結果がありません</p>
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          href="/quiz"
          className="inline-block bg-purple-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-purple-400 transition-all duration-200"
        >
          新しい診断を受ける
        </Link>
      </div>
    </div>
  );
}
