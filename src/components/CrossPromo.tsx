"use client";

const services = [
  { name: "AIレスバトル", desc: "AI同士のレストラン対決", url: "https://ai-resbattle.ezoai.jp", accent: "text-blue-400" },
  { name: "AIマシュマロ", desc: "AIに匿名で質問", url: "https://ai-marshmallow.ezoai.jp", accent: "text-pink-400" },
  { name: "AI性格診断", desc: "AIの性格タイプ分析", url: "https://ai-shindan.ezoai.jp", accent: "text-purple-400" },
  { name: "AIロースト", desc: "AIの愛あるツッコミ", url: "https://ai-roast.ezoai.jp", accent: "text-orange-400" },
  { name: "AI競プロ", desc: "AIのコーディング対決", url: "https://ai-competitive-programming.ezoai.jp", accent: "text-cyan-400" },
  { name: "AIキャッチコピー", desc: "AIがプロ級コピーを生成", url: "https://ai-catchcopy.ezoai.jp", accent: "text-emerald-400" },
  { name: "AI面接練習", desc: "AIが面接官になって模擬面接", url: "https://ai-interview.ezoai.jp", accent: "text-amber-400" },
];

export default function CrossPromo({ current }: { current: string }) {
  const others = services.filter((s) => s.name !== current);
  return (
    <div className="border-t border-white/10 mt-16 pt-8 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <a
          href="https://ezoai.jp"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-6 bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200 text-center"
        >
          <span className="text-white/60 text-sm font-bold">ezoai.jp</span>
          <span className="text-white/20 text-sm mx-2">/</span>
          <span className="text-white/40 text-sm">7つのAIサービスをまとめてチェック</span>
        </a>
        <p className="text-white/30 text-xs tracking-widest uppercase mb-4 text-center">
          AI Agent Services
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {others.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <div className={`text-sm font-bold ${s.accent}`}>{s.name}</div>
              <div className="text-white/40 text-xs mt-1">{s.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
