"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
        if (!res.ok) throw new Error("診断に失敗しました");
        const data = await res.json();
        router.push(`/result/${data.id}`);
      } catch {
        toast.error("診断中にエラーが発生しました。もう一度お試しください。");
        setLoading(false);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white text-xl font-bold mb-2">AIが分析中...</p>
          <p className="text-white/60 text-sm">あなたの回答を深く読み解いています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>質問 {current + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Question */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-6 transition-all duration-200">
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
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm md:text-base cursor-pointer ${
                selected === opt.value
                  ? "bg-purple-600/30 border-purple-500 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
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
          className="w-full bg-purple-500 hover:bg-purple-400 text-white py-6 rounded-full font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {isLast ? "診断する" : "次の質問へ  -->"}
        </Button>
      </div>
    </div>
  );
}
