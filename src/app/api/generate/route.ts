import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/ai";
import { buildFreeformPrompt, createAnalysisResult } from "@/lib/analysis";

const RATE_LIMIT = 10;
const RATE_WINDOW = 600;

const memoryRateLimit = new Map<string, { count: number; expires: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const key = `ratelimit:shindan:generate:${ip}`;
      const count = (await kv.get<number>(key)) ?? 0;
      if (count >= RATE_LIMIT) return false;
      await kv.set(key, count + 1, { ex: RATE_WINDOW });
      return true;
    } catch {}
  }

  const now = Date.now();
  const entry = memoryRateLimit.get(ip);
  if (entry && entry.expires > now) {
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
  }
  memoryRateLimit.set(ip, { count: 1, expires: now + RATE_WINDOW * 1000 });
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "利用回数の上限に達しました。10分後に再度お試しください。" },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
    }

    const { name, interests, personality, style } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "名前を入力してください。" }, { status: 400 });
    }
    if (!interests?.trim()) {
      return NextResponse.json({ error: "趣味・興味を入力してください。" }, { status: 400 });
    }

    const validStyles = ["cool", "cute", "dark", "creative"];
    const safeStyle = validStyles.includes(style) ? style : "cool";

    const safeName = sanitizeInput(String(name), 50);
    const safeInterests = sanitizeInput(String(interests), 300);
    const safePersonality = sanitizeInput(String(personality ?? ""), 200);

    const prompt = buildFreeformPrompt(safeName, safeInterests, safePersonality, safeStyle);

    const result = await createAnalysisResult({
      mode: "freeform",
      prompt,
      name: safeName,
      style: safeStyle,
      source: "web",
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "カードの生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
