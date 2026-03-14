import { nanoid } from "nanoid";
import { callAI } from "./ai";
import { questions } from "@/data/questions";
import type { AnalysisResult, ColorScheme, ProfileStat } from "@/types";

const COLOR_SCHEMES: ColorScheme[] = ["red", "blue", "green", "purple", "yellow", "pink"];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

// ---- Prompt Builders ----

export function buildQuizPrompt(answers: Record<number, string>): string {
  const answerLines = questions
    .map((q) => {
      const selectedOption = q.options.find((o) => o.value === answers[q.id]);
      return `Q${q.id}: ${q.text}\n→ ${selectedOption?.label ?? "未回答"}`;
    })
    .join("\n\n");

  return `あなたはプロの性格分析AIです。以下の10問の回答を元に、その人の性格タイプを詳しく分析してください。

【回答データ】
${answerLines}

以下のJSON形式のみで回答してください。説明文や前置きは不要です。絵文字は使わないでください。

{
  "personalityType": "性格タイプ名（例：情熱の指揮者型、共感の守護者型など、ユニークで覚えやすい名前）",
  "title": "その人を一言で表すキャッチーな二つ名（5-15文字、例: 深夜の思索家）",
  "catchcopy": "カッコいいキャッチコピー（15-30文字）",
  "description": "この性格タイプの詳しい説明（120〜150文字、です・ます調）",
  "traits": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
  "stats": [
    {"label": "分析力", "value": 数値(50-99)},
    {"label": "社交性", "value": 数値(50-99)},
    {"label": "創造性", "value": 数値(50-99)},
    {"label": "決断力", "value": 数値(50-99)},
    {"label": "適応力", "value": 数値(50-99)}
  ],
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3"],
  "colorScheme": "red | blue | green | purple | yellow | pink のいずれか",
  "advice": "この性格タイプへのAIからの具体的なアドバイス（80〜100文字、です・ます調）"
}

重要:
- JSONのみを出力してください
- statsの能力名は回答内容に合ったユニークなものにしてください
- statsのvalueは50-99の範囲で適度にバラつきを持たせてください
- titleは印象的で個性的なものにしてください
- ハッシュタグは3つ、日本語で`;
}

export function buildFreeformPrompt(
  name: string,
  interests: string,
  personality?: string,
  style?: string
): string {
  return `あなたはプロフィールカードデザイナー兼性格分析AIです。ユーザーの情報からオシャレな自己紹介カードの内容を生成してください。

【ユーザー情報】
- 名前: ${name}
- 趣味・興味: ${interests}
${personality ? `- 性格・特徴: ${personality}` : ""}
- カードの雰囲気: ${style ?? "cool"}

以下のJSON形式で回答してください。日本語で回答。絵文字は使わないでください。

{
  "personalityType": "性格タイプ名（例: 探究者タイプ、自由人タイプ）",
  "title": "その人を一言で表すキャッチーな二つ名（5-15文字、例: 深夜のコード職人）",
  "catchcopy": "カッコいいorかわいいキャッチコピー（15-30文字）",
  "description": "その人の魅力を伝える紹介文（50-80文字）",
  "traits": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
  "stats": [
    {"label": "能力名1", "value": 数値(50-99)},
    {"label": "能力名2", "value": 数値(50-99)},
    {"label": "能力名3", "value": 数値(50-99)},
    {"label": "能力名4", "value": 数値(50-99)},
    {"label": "能力名5", "value": 数値(50-99)}
  ],
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3"],
  "colorScheme": "red | blue | green | purple | yellow | pink のいずれか",
  "advice": "この人へのアドバイス（80〜100文字）"
}

重要:
- JSONのみを出力してください
- statsの能力名はその人の趣味・性格に合ったユニークなものにしてください
- statsのvalueは50-99の範囲で適度にバラつきを持たせてください`;
}

// ---- Result Creation ----

function parseAIResponse(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    return JSON.parse(jsonMatch[0]);
  }
}

function validateStats(raw: unknown): ProfileStat[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 5).map((s: { label: string; value: number }) => ({
    label: String(s.label || "").slice(0, 20),
    value: Math.min(99, Math.max(50, Number(s.value) || 70)),
  }));
}

export async function createAnalysisResult(opts: {
  mode: "quiz" | "freeform";
  prompt: string;
  name?: string;
  style?: string;
  agentName?: string;
  agentDescription?: string;
  source?: "web" | "mcp";
  profileId?: string;
}): Promise<AnalysisResult> {
  const text = await callAI(opts.prompt);
  const parsed = parseAIResponse(text);

  const colorScheme = COLOR_SCHEMES.includes(parsed.colorScheme as ColorScheme)
    ? (parsed.colorScheme as ColorScheme)
    : "purple";

  const id = nanoid(10);
  const result: AnalysisResult = {
    id,
    name: opts.name,
    personalityType: String(parsed.personalityType ?? "ユニーク型").slice(0, 30),
    title: String(parsed.title ?? "").slice(0, 30),
    catchcopy: String(parsed.catchcopy ?? "").slice(0, 60),
    description: String(parsed.description ?? "").slice(0, 300),
    traits: Array.isArray(parsed.traits)
      ? parsed.traits.slice(0, 6).map((t: string) => String(t).slice(0, 20))
      : [],
    stats: validateStats(parsed.stats),
    hashtags: Array.isArray(parsed.hashtags)
      ? parsed.hashtags.slice(0, 3).map((h: string) => String(h).slice(0, 30))
      : [],
    colorScheme,
    advice: String(parsed.advice ?? "").slice(0, 200),
    source: opts.source ?? "web",
    mode: opts.mode,
    style: opts.style,
    createdAt: Date.now(),
    ...(opts.agentName && { agentName: opts.agentName }),
    ...(opts.agentDescription && { agentDescription: opts.agentDescription }),
    ...(opts.profileId && { profileId: opts.profileId }),
  };

  // Generate share text
  const topTraits = result.traits.slice(0, 3).join("・");
  result.shareText = `AI自己分析の結果「${result.personalityType}」＝「${result.title}」でした！ ${topTraits}\n\n${result.catchcopy}\n\n#AI自己分析 ${siteUrl}/result/${id}`;

  // Store in KV
  await storeResult(result);

  // Accumulate type stats
  try {
    const { incrementTypeStat } = await import("./stats");
    await incrementTypeStat(result.personalityType, result.stats, result.traits);
  } catch {}

  // Link to profile if provided
  if (opts.profileId) {
    try {
      const { addResultToProfile } = await import("./profile");
      await addResultToProfile(opts.profileId, id, opts.name);
    } catch {}
  }

  return result;
}

// ---- Storage ----

async function storeResult(result: AnalysisResult): Promise<void> {
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(`result:${result.id}`, result, { ex: 60 * 60 * 24 * 365 });
      await kv.zadd("results:feed", { score: result.createdAt, member: result.id });
    } catch (e) {
      console.error("KV store error:", e);
    }
  }
}

export async function getResult(id: string): Promise<AnalysisResult | null> {
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      return await kv.get<AnalysisResult>(`result:${id}`);
    } catch {}
  }
  return null;
}
