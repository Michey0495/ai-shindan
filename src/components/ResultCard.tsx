"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatedStats } from "./AnimatedStats";
import { CardReveal } from "./CardReveal";
import { CardDownload } from "./CardDownload";
import { getTheme } from "@/lib/styles";
import type { AnalysisResult } from "@/types";

type Props = {
  result: AnalysisResult;
};

export default function ResultCard({ result }: Props) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const resultUrl = `${siteUrl}/result/${result.id}`;
  const theme = getTheme(result.style);

  const tweetText = encodeURIComponent(
    `AI自己分析の結果「${result.personalityType}」＝「${result.title}」でした！\n\n${result.catchcopy}\n\n#AI自己分析`
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
      <CardReveal>
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                {result.agentName && (
                  <p className="text-white/30 text-xs mb-2">
                    Analyzed by: {result.agentName}
                  </p>
                )}
                <p className={`${theme.accent} text-xs font-bold tracking-widest mb-2`}>
                  {result.personalityType}
                </p>
                {result.name && (
                  <p className="text-white font-black text-2xl">{result.name}</p>
                )}
                <p className={`${theme.accent} font-bold text-lg mt-1`}>
                  {result.title}
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              {result.catchcopy}
            </p>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-white/10">
            <p className="text-white/40 text-xs font-medium mb-2">ABOUT</p>
            <p className="text-white/70 text-sm leading-relaxed">{result.description}</p>
          </div>

          {/* Stats */}
          {result.stats && result.stats.length > 0 && (
            <div className="p-6 border-b border-white/10">
              <p className="text-white/40 text-xs font-medium mb-4">STATUS</p>
              <AnimatedStats
                stats={result.stats}
                barColor={theme.barColor}
                accentText={theme.accent}
              />
            </div>
          )}

          {/* Traits */}
          {result.traits.length > 0 && (
            <div className="p-6 border-b border-white/10">
              <p className="text-white/40 text-xs font-medium mb-3">TRAITS</p>
              <div className="flex flex-wrap gap-2">
                {result.traits.map((trait) => (
                  <Badge
                    key={trait}
                    className={`${theme.tagBg} ${theme.tagText} text-xs px-3 py-1.5 rounded-full border ${theme.tagBorder}`}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {result.hashtags && result.hashtags.length > 0 && (
            <div className="p-6 border-b border-white/10">
              <p className="text-white/40 text-xs font-medium mb-3">TAGS</p>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className={`${theme.tagBg} ${theme.tagText} text-xs px-3 py-1.5 rounded-full border ${theme.tagBorder}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          <div className="p-6 border-b border-white/10">
            <p className="text-white/40 text-xs font-medium mb-2">ADVICE</p>
            <p className="text-white/60 text-sm leading-relaxed">{result.advice}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
            <span className="text-white/30 text-xs">by AI自己分析</span>
            <span className="text-white/20 text-xs">ai-shindan.ezoai.jp</span>
          </div>
        </div>
      </CardReveal>

      {/* Share text */}
      {result.shareText && (
        <div className="mb-6">
          <div className="text-xs text-white/40 mb-2">シェアテキスト</div>
          <div
            onClick={handleCopyShareText}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/60 text-sm leading-relaxed hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {result.shareText}
          </div>
          <p className="text-white/30 text-xs mt-1.5">クリックでコピー</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <CardDownload cardId={result.id} />

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

      {/* Navigation */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex gap-4">
          <Link href="/feed" className="text-white/50 text-sm hover:text-purple-400 transition-all duration-200">
            みんなの結果
          </Link>
          <Link href="/stats" className="text-white/50 text-sm hover:text-purple-400 transition-all duration-200">
            タイプ統計
          </Link>
          <Link href={`/result/${result.id}/similar`} className="text-white/50 text-sm hover:text-purple-400 transition-all duration-200">
            似ているタイプ
          </Link>
        </div>
        <div className="flex gap-4">
          <Link href="/quiz">
            <Button variant="ghost" className="text-white/60 hover:text-white transition-all duration-200 cursor-pointer">
              10問で深層分析
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="ghost" className="text-white/60 hover:text-white transition-all duration-200 cursor-pointer">
              プロフカードを作る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
