import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShimmerText } from "@/components/spell/ShimmerText";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.3),transparent)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/5 rounded-full blur-[100px] animate-[float-reverse_12s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="relative text-center px-4 animate-[fade-in-up_0.8s_ease-out]">
          <ShimmerText variant="purple" className="text-sm font-bold tracking-widest mb-3">
            {"// AI PERSONALITY"}
          </ShimmerText>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            AI性格診断
          </h1>
          <p className="text-white/50 text-lg mb-2">10の質問に答えるだけ</p>
          <p className="text-white text-xl">
            AIがあなたの
            <span className="text-purple-400 font-bold">本当の性格</span>
            を分析します
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      <div className="text-center max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-10 text-sm text-white/50">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-purple-400 text-sm font-bold mb-1">01</div>
            <div>約1分で完了</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-purple-400 text-sm font-bold mb-1">02</div>
            <div>AI深層分析</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-purple-400 text-sm font-bold mb-1">03</div>
            <div>SNSシェア</div>
          </div>
        </div>

        <Link href="/quiz">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg px-10 py-6 rounded-full font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-105"
          >
            診断スタート →
          </Button>
        </Link>

        <p className="mt-6 text-xs text-white/30">
          登録不要・無料・何度でも診断OK
        </p>
      </div>
    </div>
  );
}
