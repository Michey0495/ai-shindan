"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CardDownload({ cardId }: { cardId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/result/${cardId}/card-image`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shindan-${cardId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("カード画像をダウンロードしました");
    } catch {
      toast.error("ダウンロードに失敗しました");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full bg-white/5 text-white/70 font-medium px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? "ダウンロード中..." : "カード画像を保存する"}
    </button>
  );
}
