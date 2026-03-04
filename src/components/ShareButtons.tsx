"use client";

import { toast } from "sonner";

interface ShareButtonsProps {
  shareText: string;
  shareUrl: string;
}

export function ShareButtons({ shareText, shareUrl }: ShareButtonsProps) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("リンクをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <div className="flex gap-3">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-white/10 text-white font-medium px-4 py-2.5 rounded-lg text-center text-sm hover:bg-white/20 transition-all duration-200 cursor-pointer"
      >
        X (Twitter) でシェア
      </a>
      <button
        onClick={handleCopy}
        className="flex-1 bg-white/5 text-white/70 font-medium px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
      >
        リンクをコピー
      </button>
    </div>
  );
}
