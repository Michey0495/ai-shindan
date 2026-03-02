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
    toast.success("リンクをコピーしました");
  }

  async function handleCopyShareText() {
    if (result.shareText) {
      await navigator.clipboard.writeText(result.shareText);
      toast.success("シェアテキストをコピーしました");
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Result Card */}
      <div
        id="result-card"
        className="bg-white/5 border border-white/10 p-1 rounded-3xl mb-6"
      >
        <div className="bg-black rounded-3xl p-8 text-center">
          {/* Agent name */}
          {result.agentName && (
            <div className="text-xs text-white/30 mb-3">
              Diagnosed by: {result.agentName}
            </div>
          )}

          <div className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-2">
            あなたの性格タイプ
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${colors.text} mb-4`}>
            {result.personalityType}
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            {result.description}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {result.traits.map((trait) => (
              <Badge
                key={trait}
                className="text-white/80 bg-white/5 border-white/10 text-xs px-3 py-1"
              >
                {trait}
              </Badge>
            ))}
          </div>

          {/* Advice */}
          <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 transition-all duration-200">
            <div className="text-xs font-bold text-white/40 mb-2">
              AIからのアドバイス
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{result.advice}</p>
          </div>
        </div>
      </div>

      {/* Share text block */}
      {result.shareText && (
        <div className="mb-6">
          <div className="text-xs text-white/40 mb-2">シェアテキスト</div>
          <div
            onClick={handleCopyShareText}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/60 text-sm leading-relaxed hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {result.shareText}
          </div>
          <p className="text-white/30 text-xs mt-1.5">
            クリックでコピー
          </p>
        </div>
      )}

      {/* Share buttons */}
      <div className="space-y-3">
        <p className="text-center text-white/40 text-sm">結果をシェアする</p>
        <div className="flex gap-3">
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-5 transition-all duration-200 cursor-pointer">
              X (Twitter)
            </Button>
          </a>
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-5 transition-all duration-200 cursor-pointer">
              LINE
            </Button>
          </a>
          <Button
            onClick={handleCopyLink}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-5 transition-all duration-200 cursor-pointer"
          >
            リンク
          </Button>
        </div>
      </div>

      {/* Navigation links */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex gap-4">
          <Link
            href="/feed"
            className="text-white/50 text-sm hover:text-purple-400 transition-all duration-200"
          >
            診断フィード
          </Link>
          <Link
            href={`/result/${result.id}/similar`}
            className="text-white/50 text-sm hover:text-purple-400 transition-all duration-200"
          >
            似ているタイプを探す
          </Link>
        </div>
        <Link href="/quiz">
          <Button variant="ghost" className="text-white/60 hover:text-white transition-all duration-200 cursor-pointer">
            もう一度診断する
          </Button>
        </Link>
      </div>
    </div>
  );
}
