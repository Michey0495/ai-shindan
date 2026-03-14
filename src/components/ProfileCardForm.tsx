"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const styleOptions = [
  { value: "cool", label: "クール", dot: "bg-sky-400", selBg: "bg-sky-500/20", selBorder: "border-sky-400/50", selText: "text-sky-300" },
  { value: "cute", label: "キュート", dot: "bg-pink-400", selBg: "bg-pink-500/20", selBorder: "border-pink-400/50", selText: "text-pink-300" },
  { value: "dark", label: "ダーク", dot: "bg-violet-400", selBg: "bg-violet-500/20", selBorder: "border-violet-400/50", selText: "text-violet-300" },
  { value: "creative", label: "クリエイティブ", dot: "bg-amber-400", selBg: "bg-amber-500/20", selBorder: "border-amber-400/50", selText: "text-amber-300" },
];

const loadingMessages = [
  "プロフィールを分析中...",
  "キャッチコピーを考案中...",
  "ステータスを算出中...",
  "カードをデザイン中...",
];

export function ProfileCardForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [form, setForm] = useState({
    name: "",
    interests: "",
    personality: "",
    style: "cool",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      toast.error("名前を入力してください");
      return;
    }
    if (!form.interests?.trim()) {
      toast.error("趣味・興味を入力してください");
      return;
    }

    setLoading(true);
    setLoadingMsg(0);

    const interval = setInterval(() => {
      setLoadingMsg((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 2000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "エラーが発生しました");
        return;
      }

      router.push(`/result/${data.id}`);
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="name" className="text-sm font-medium text-white/70">
              名前・ニックネーム <span className="text-purple-400">*</span>
            </label>
            <span className="text-xs text-white/30">{form.name.length}/50</span>
          </div>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例: たろう、Alice、推しの名前でもOK"
            maxLength={50}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="interests" className="text-sm font-medium text-white/70">
              趣味・興味 <span className="text-purple-400">*</span>
            </label>
            <span className="text-xs text-white/30">{form.interests.length}/300</span>
          </div>
          <textarea
            id="interests"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            placeholder="例: ゲーム、アニメ、カフェ巡り、プログラミング、旅行..."
            maxLength={300}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="personality" className="text-sm font-medium text-white/70">
              性格・特徴
            </label>
            <span className="text-xs text-white/30">{form.personality.length}/200</span>
          </div>
          <input
            id="personality"
            type="text"
            value={form.personality}
            onChange={(e) => setForm({ ...form, personality: e.target.value })}
            placeholder="例: マイペース、好奇心旺盛、インドア派..."
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-white/70 mb-1.5" id="style-label">
            カードの雰囲気
          </span>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="style-label">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={form.style === opt.value}
                onClick={() => setForm({ ...form, style: opt.value })}
                className={`text-sm py-2 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  form.style === opt.value
                    ? `${opt.selBg} ${opt.selBorder} ${opt.selText}`
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-purple-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-purple-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {loadingMessages[loadingMsg]}
          </span>
        ) : (
          "プロフカードを生成する"
        )}
      </button>
    </form>
  );
}
