import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { questions } from "@/data/questions";
import type { DiagnosisResult, DiagnoseRequest } from "@/types";

const client = new Anthropic();

const COLOR_SCHEMES = ["red", "blue", "green", "purple", "yellow", "pink"] as const;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shindan.ezoai.jp";

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
  "description": "この性格タイプの詳しい説明（120〜150文字、です・ます調）",
  "traits": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
  "colorScheme": "red | blue | green | purple | yellow | pink のいずれか（性格に合ったもの）",
  "advice": "この性格タイプへのAIからの具体的なアドバイス（80〜100文字、です・ます調）"
}`;
}

function generateShareText(result: DiagnosisResult): string {
  const topTraits = result.traits.slice(0, 3).join("・");
  return `私の性格タイプは「${result.personalityType}」でした！ ${topTraits} #AI性格診断 ${siteUrl}/result/${result.id}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();
    const { answers, agentName, agentDescription, source } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const prompt = buildPrompt(answers);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

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
      description: parsed.description ?? "",
      traits: Array.isArray(parsed.traits) ? parsed.traits.slice(0, 6) : [],
      colorScheme,
      advice: parsed.advice ?? "",
      createdAt: Date.now(),
      ...(agentName && { agentName }),
      ...(agentDescription && { agentDescription }),
      source: source ?? "web",
    };

    result.shareText = generateShareText(result);

    await kv.set(`result:${id}`, result, { ex: 60 * 60 * 24 * 30 }); // 30日保存
    await kv.zadd("results:feed", { score: result.createdAt, member: result.id });

    return NextResponse.json({ id, shareText: result.shareText });
  } catch (err) {
    console.error("Diagnose error:", err);
    return NextResponse.json(
      { error: "診断処理に失敗しました" },
      { status: 500 }
    );
  }
}
