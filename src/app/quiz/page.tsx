"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Spinner } from "@/components/spell/Spinner";

export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const question = questions[current];
  const progress = ((current + (selected ? 1 : 0)) / questions.length) * 100;
  const isLast = current === questions.length - 1;

  function handleSelect(value: string) {
    setSelected(value);
  }

  async function handleNext() {
    if (!selected) return;

    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      setLoading(true);
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "診断に失敗しました");
        }
        const data = await res.json();
        router.push(`/result/${data.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "診断中にエラーが発生しました。もう一度お試しください。");
        setLoading(false);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
        <div className="text-center">
          <Spinner size="lg" className="text-purple-400 mb-6" />
          <p className="text-white text-xl font-bold mb-2">AIが分析中...</p>
          <p className="text-gray-400 text-sm">あなたの回答を深く読み解いています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>質問 {current + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Question */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
          <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm md:text-base ${
                selected === opt.value
                  ? "bg-purple-600/30 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <span className="font-bold text-purple-400 mr-3">{opt.value}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 rounded-full font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLast ? "診断する" : "次の質問へ"} →
        </Button>
      </div>
    </div>
  );
}
