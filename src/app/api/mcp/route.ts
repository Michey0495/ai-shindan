import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { callAI, sanitizeInput } from "@/lib/ai";
import { buildDiagnosisPrompt } from "@/app/api/diagnose/route";
import type { DiagnosisResult } from "@/types";

const COLOR_SCHEMES = ["red", "blue", "green", "purple", "yellow", "pink"] as const;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 600;
const memRateMap = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      const key = `ratelimit:shindan:mcp:${ip}`;
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

function generateShareText(result: DiagnosisResult): string {
  const topTraits = result.traits.slice(0, 3).join("・");
  return `私の性格タイプは「${result.personalityType}」でした！ ${topTraits} #AI性格診断 ${siteUrl}/result/${result.id}`;
}

// Tool definitions
const TOOLS = [
  {
    name: "diagnose_personality",
    description:
      "AI性格診断 - 10問の回答データから性格タイプを分析します。各質問にA/B/C/Dのいずれかで回答してください。",
    inputSchema: {
      type: "object" as const,
      properties: {
        answers: {
          type: "object" as const,
          description:
            '回答データ。キーは質問ID(1-10)、値はA/B/C/Dのいずれか。例: {"1":"A","2":"B",...}',
          additionalProperties: { type: "string", enum: ["A", "B", "C", "D"] },
        },
        agentName: {
          type: "string" as const,
          description: "診断を受けるAIエージェントの名前（任意）",
        },
        agentDescription: {
          type: "string" as const,
          description: "AIエージェントの簡単な説明（任意）",
        },
      },
      required: ["answers"],
    },
  },
  {
    name: "get_recent_results",
    description:
      "最近の診断結果を取得します。AIエージェントたちの最新の性格診断フィードを確認できます。",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number" as const,
          description: "取得件数（デフォルト20、最大50）",
        },
      },
    },
  },
  {
    name: "get_similar_types",
    description:
      "指定した診断結果と似ている性格タイプを持つ他の診断結果を探します。同じ性格タイプや重複する特徴を持つ結果を返します。",
    inputSchema: {
      type: "object" as const,
      properties: {
        resultId: {
          type: "string" as const,
          description: "診断結果のID",
        },
      },
      required: ["resultId"],
    },
  },
  {
    name: "generate_share_text",
    description:
      "指定した診断結果のSNS投稿用テキストを生成します。X(Twitter)の280文字制限に収まるテキストを返します。",
    inputSchema: {
      type: "object" as const,
      properties: {
        resultId: {
          type: "string" as const,
          description: "診断結果のID",
        },
      },
      required: ["resultId"],
    },
  },
];

async function handleDiagnose(
  answers: Record<number, string>,
  agentName?: string,
  agentDescription?: string
): Promise<DiagnosisResult> {
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
    ...(agentName && { agentName }),
    ...(agentDescription && { agentDescription }),
    source: "mcp",
  };

  result.shareText = generateShareText(result);

  const { kv } = await import("@vercel/kv");
  await kv.set(`result:${id}`, result, { ex: 60 * 60 * 24 * 365 });
  await kv.zadd("results:feed", { score: result.createdAt, member: result.id });

  return result;
}

async function handleGetRecentResults(limit: number = 20): Promise<DiagnosisResult[]> {
  const { kv } = await import("@vercel/kv");
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const ids = await kv.zrange("results:feed", 0, safeLimit - 1, { rev: true });

  if (!ids || ids.length === 0) return [];

  const results: DiagnosisResult[] = [];
  for (const id of ids) {
    const result = await kv.get<DiagnosisResult>(`result:${id}`);
    if (result) results.push(result);
  }

  return results;
}

async function handleGetSimilarTypes(resultId: string): Promise<DiagnosisResult[]> {
  const { kv } = await import("@vercel/kv");
  const target = await kv.get<DiagnosisResult>(`result:${resultId}`);
  if (!target) throw new Error("Result not found");

  const ids = await kv.zrange("results:feed", 0, 49, { rev: true });
  if (!ids || ids.length === 0) return [];

  const similar: DiagnosisResult[] = [];
  for (const id of ids) {
    if (id === resultId) continue;
    const result = await kv.get<DiagnosisResult>(`result:${id}`);
    if (!result) continue;

    const sameType = result.personalityType === target.personalityType;
    const overlappingTraits = result.traits.filter((t) => target.traits.includes(t));
    if (sameType || overlappingTraits.length >= 2) {
      similar.push(result);
    }
    if (similar.length >= 10) break;
  }

  return similar;
}

async function handleGenerateShareText(resultId: string): Promise<string> {
  const { kv } = await import("@vercel/kv");
  const result = await kv.get<DiagnosisResult>(`result:${resultId}`);
  if (!result) throw new Error("Result not found");

  if (result.shareText) return result.shareText;

  const shareText = generateShareText(result);

  result.shareText = shareText;
  await kv.set(`result:${resultId}`, result, { ex: 60 * 60 * 24 * 365 });

  return shareText;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, id: requestId, params } = body;

    switch (method) {
      case "tools/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: requestId ?? null,
          result: {
            tools: TOOLS,
          },
        });
      }

      case "tools/call": {
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (await isRateLimited(ip)) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id: requestId ?? null,
            error: { code: -32000, message: "Rate limit exceeded. Try again later." },
          });
        }

        const toolName = params?.name;
        const toolArgs = params?.arguments;

        switch (toolName) {
          case "diagnose_personality": {
            if (!toolArgs?.answers || typeof toolArgs.answers !== "object") {
              return NextResponse.json({
                jsonrpc: "2.0",
                id: requestId ?? null,
                error: {
                  code: -32602,
                  message: "Invalid params: answers object is required",
                },
              });
            }

            const result = await handleDiagnose(
              toolArgs.answers,
              toolArgs.agentName ? sanitizeInput(String(toolArgs.agentName), 100) : undefined,
              toolArgs.agentDescription ? sanitizeInput(String(toolArgs.agentDescription), 300) : undefined
            );

            return NextResponse.json({
              jsonrpc: "2.0",
              id: requestId ?? null,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              },
            });
          }

          case "get_recent_results": {
            const results = await handleGetRecentResults(toolArgs?.limit ?? 20);

            return NextResponse.json({
              jsonrpc: "2.0",
              id: requestId ?? null,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(results, null, 2),
                  },
                ],
              },
            });
          }

          case "get_similar_types": {
            if (!toolArgs?.resultId) {
              return NextResponse.json({
                jsonrpc: "2.0",
                id: requestId ?? null,
                error: {
                  code: -32602,
                  message: "Invalid params: resultId is required",
                },
              });
            }

            const similar = await handleGetSimilarTypes(toolArgs.resultId);

            return NextResponse.json({
              jsonrpc: "2.0",
              id: requestId ?? null,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(similar, null, 2),
                  },
                ],
              },
            });
          }

          case "generate_share_text": {
            if (!toolArgs?.resultId) {
              return NextResponse.json({
                jsonrpc: "2.0",
                id: requestId ?? null,
                error: {
                  code: -32602,
                  message: "Invalid params: resultId is required",
                },
              });
            }

            const shareText = await handleGenerateShareText(toolArgs.resultId);

            return NextResponse.json({
              jsonrpc: "2.0",
              id: requestId ?? null,
              result: {
                content: [
                  {
                    type: "text",
                    text: shareText,
                  },
                ],
              },
            });
          }

          default: {
            return NextResponse.json({
              jsonrpc: "2.0",
              id: requestId ?? null,
              error: {
                code: -32601,
                message: `Unknown tool: ${toolName}`,
              },
            });
          }
        }
      }

      case "initialize": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: requestId ?? null,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "ai-shindan",
              version: "0.2.0",
            },
          },
        });
      }

      default: {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: requestId ?? null,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        });
      }
    }
  } catch (err) {
    console.error("MCP error:", err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint for tool discovery
export async function GET() {
  return NextResponse.json({
    name: "ai-shindan",
    version: "0.2.0",
    description:
      "AI性格診断 MCP Server - 10問の質問から性格タイプを分析。AIエージェント同士の性格比較やSNSシェアも可能。",
    tools: TOOLS,
    endpoints: {
      mcp: "/api/mcp",
      feed: "/api/feed",
      similar: "/api/similar/{id}",
    },
  });
}
