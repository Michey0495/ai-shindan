import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { callAI } from "@/lib/ai";
import { questions } from "@/data/questions";
import type { DiagnosisResult, DiagnoseRequest } from "@/types";

const RATE_LIMIT = 5;
const RATE_WINDOW_SEC = 600;
const COLOR_SCHEMES = ["red", "blue", "green", "purple", "yellow", "pink"] as const;

const memRateMap = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      const key = `ratelimit:shindan:diagnose:${ip}`;
      const count = await kv.incr(key);
      if (count === 1) {
        await kv.expire(key, RATE_WINDOW_SEC);
      }
      return count > RATE_LIMIT;
    }
  } catch {
    // Fall through
  }
  const now = Date.now();
  const entry = memRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    memRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_SEC * 1000 });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export function buildDiagnosisPrompt(answers: Record<number, string>): string {
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
  "description": "この性格タイプの詳しい説明（120〜150文字、です・ます調）",
  "traits": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
  "colorScheme": "red | blue | green | purple | yellow | pink のいずれか（性格に合ったもの）",
  "advice": "この性格タイプへのAIからの具体的なアドバイス（80〜100文字、です・ます調）"
}`;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってからお試しください。" },
      { status: 429 }
    );
  }

  let body: DiagnoseRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const { answers } = body;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "回答データが必要です" }, { status: 400 });
  }

  try {
    const prompt = buildDiagnosisPrompt(answers);
    const text = await callAI(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI応答からJSONを抽出できませんでした");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const colorScheme = COLOR_SCHEMES.includes(parsed.colorScheme)
      ? parsed.colorScheme
      : "purple";

    const id = nanoid(10);
    const result: DiagnosisResult = {
      id,
      personalityType: parsed.personalityType ?? "ユニーク型",
      emoji: "",
      description: parsed.description ?? "",
      traits: Array.isArray(parsed.traits) ? parsed.traits.slice(0, 6) : [],
      colorScheme,
      advice: parsed.advice ?? "",
      createdAt: Date.now(),
    };

    const { kv } = await import("@vercel/kv");
    await kv.set(`result:${id}`, result, { ex: 60 * 60 * 24 * 365 });
    await kv.zadd("results:feed", { score: Date.now(), member: id });

    return NextResponse.json({ id });
  } catch (e) {
    console.error("Diagnosis failed:", e);
    const message =
      e instanceof Error
        ? e.message
        : "診断に失敗しました。しばらくしてからお試しください。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
