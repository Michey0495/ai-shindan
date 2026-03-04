import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { questions } from "@/data/questions";
import type { DiagnosisResult, DiagnoseRequest } from "@/types";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

const COLOR_SCHEMES = ["red", "blue", "green", "purple", "yellow", "pink"] as const;

function buildPrompt(answers: Record<number, string>): string {
  const answerLines = questions
    .map((q) => {
      const selectedOption = q.options.find((o) => o.value === answers[q.id]);
      return `Q${q.id}: ${q.text}\n→ ${selectedOption?.label ?? "未回答"}`;
    })
    .join("\n\n");

  return `あなたはプロの性格分析AIです。以下の10問の回答を元に、その人の性格タイプを分析してください。

【回答データ】
${answerLines}

以下のJSON形式のみで回答してください。説明文や前置きは不要です。

{
  "personalityType": "性格タイプ名（例：情熱の指揮者型、共感の守護者型など、ユニークで覚えやすい名前）",
  "emoji": "タイプを表す絵文字1つ",
  "description": "この性格タイプの詳しい説明（120〜150文字、です・ます調）",
  "traits": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
  "colorScheme": "red | blue | green | purple | yellow | pink のいずれか（性格に合ったもの）",
  "advice": "この性格タイプへのAIからの具体的なアドバイス（80〜100文字、です・ます調）"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const prompt = buildPrompt(answers);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { num_ctx: 2048, temperature: 0.7 },
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "AI生成に失敗しました。" }, { status: 502 });
    }
    const data = await res.json();
    const text = data.message?.content ?? "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate colorScheme
    const colorScheme = COLOR_SCHEMES.includes(parsed.colorScheme)
      ? parsed.colorScheme
      : "purple";

    const id = nanoid(10);
    const result: DiagnosisResult = {
      id,
      personalityType: parsed.personalityType ?? "ユニーク型",
      emoji: parsed.emoji ?? "🌟",
      description: parsed.description ?? "",
      traits: Array.isArray(parsed.traits) ? parsed.traits.slice(0, 6) : [],
      colorScheme,
      advice: parsed.advice ?? "",
      createdAt: Date.now(),
    };

    await kv.set(`result:${id}`, result, { ex: 60 * 60 * 24 * 365 }); // 365日保存
    await kv.zadd("results:feed", { score: Date.now(), member: id });

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Ollama error:", err);
    return NextResponse.json(
      { error: "AIサーバーに接続できません。" },
      { status: 503 }
    );
  }
}
