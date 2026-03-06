"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DiagnosisResult } from "@/types";

type Props = {
  result: DiagnosisResult;
  colors: { from: string; to: string; text: string };
};

export default function ResultCard({ result, colors }: Props) {
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const resultUrl = `${siteUrl}/result/${result.id}`;

  const tweetText = encodeURIComponent(
    `私の性格タイプは「${result.personalityType}」でした！\n\n${result.description.slice(0, 60)}...\n\n#AI性格診断`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(resultUrl)}`;

  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(resultUrl)}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(resultUrl);
    toast.success("リンクをコピーしました！");
  }

  return (
    <div className="w-full max-w-lg">
      {/* Result Card */}
      <div
        id="result-card"
        className={`bg-gradient-to-br ${colors.from} ${colors.to} p-1 rounded-3xl shadow-2xl mb-6`}
      >
        <div className="bg-gray-950 rounded-3xl p-8 text-center">
          <div className="text-sm font-mono text-white/30 tracking-[0.3em] uppercase mb-4">Type</div>
          <div className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">
            あなたの性格タイプ
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${colors.text} mb-4`}>
            {result.personalityType}
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            {result.description}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {result.traits.map((trait) => (
              <Badge
                key={trait}
                className={`${colors.text} bg-white/10 border-white/20 text-xs px-3 py-1`}
              >
                {trait}
              </Badge>
            ))}
          </div>

          {/* Advice */}
          <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">AIからのアドバイス</div>
            <p className="text-gray-300 text-sm leading-relaxed">{result.advice}</p>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="space-y-3">
        <p className="text-center text-gray-500 text-sm">結果をシェアする</p>
        <div className="flex gap-3">
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full bg-black hover:bg-gray-900 text-white border border-white/20 rounded-xl py-5">
              𝕏 でシェア
            </Button>
          </a>
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-5">
              LINE
            </Button>
          </a>
          <Button
            onClick={handleCopyLink}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-5"
          >
            リンクコピー
          </Button>
        </div>
      </div>

      {/* Retry */}
      <div className="mt-6 text-center">
        <Link href="/quiz">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            もう一度診断する →
          </Button>
        </Link>
      </div>
    </div>
  );
}
