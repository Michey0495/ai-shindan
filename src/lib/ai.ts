/** MCP/API入力のサニタイズ: 制御文字除去 + 長さ制限 */
export function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, maxLength)
    .trim();
}

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

export async function callAI(prompt: string): Promise<string> {
  if (ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    return block.type === "text" ? block.text : "";
  }

  // Ollama (local or Cloudflare Tunnel)
  try {
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
    if (res.ok) {
      const data = await res.json();
      return data.message?.content ?? "";
    }
  } catch {}

  // Together AI fallback
  if (TOGETHER_API_KEY) {
    const res = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  throw new Error("AI backend unavailable");
}
