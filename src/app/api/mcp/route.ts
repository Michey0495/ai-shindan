import { NextRequest, NextResponse } from "next/server";
import { questions } from "@/data/questions";
import {
  buildQuizPrompt,
  buildFreeformPrompt,
  createAnalysisResult,
  getResult,
} from "@/lib/analysis";
import { getOrComputeStats, getTotalStats } from "@/lib/stats";
import { getProfileWithResults } from "@/lib/profile";
import type { AnalysisResult } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

function sanitizeInput(str: string, maxLen: number = 200): string {
  return String(str).replace(/[<>&"']/g, "").trim().slice(0, maxLen);
}

// ---- Tool Definitions ----

const TOOLS = [
  {
    name: "diagnose_personality",
    description:
      "AI自己分析 - 10問の回答データから性格タイプ・能力値・二つ名を分析。画像カード・統計データも生成されます。",
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
    name: "generate_profile_card",
    description:
      "プロフカード生成 - 名前と趣味から、能力値・二つ名付きのビジュアルカードを生成。画像URLも返します。",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string" as const,
          description: "カードに表示する名前",
        },
        interests: {
          type: "string" as const,
          description: "趣味・興味（カンマ区切りまたは自由記述）",
        },
        personality: {
          type: "string" as const,
          description: "性格・特徴（任意）",
        },
        style: {
          type: "string" as const,
          description: "カードの雰囲気: cool / cute / dark / creative",
          enum: ["cool", "cute", "dark", "creative"],
        },
        agentName: {
          type: "string" as const,
          description: "生成リクエスト元のAIエージェント名（任意）",
        },
      },
      required: ["name", "interests"],
    },
  },
  {
    name: "get_type_statistics",
    description:
      "性格タイプ統計 - 全診断データから性格タイプの分布・平均能力値・共通特徴を返します。特定タイプ指定も可能。",
    inputSchema: {
      type: "object" as const,
      properties: {
        typeName: {
          type: "string" as const,
          description: "特定の性格タイプ名で絞り込み（任意。省略で全タイプ）",
        },
      },
    },
  },
  {
    name: "get_recent_results",
    description:
      "最近の分析結果を取得。AIエージェントたちの最新の性格分析フィードを確認できます。",
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
    name: "compare_results",
    description:
      "2つの分析結果を比較。性格タイプ・能力値・特徴の共通点と相違点を返します。",
    inputSchema: {
      type: "object" as const,
      properties: {
        resultId1: {
          type: "string" as const,
          description: "比較元の結果ID",
        },
        resultId2: {
          type: "string" as const,
          description: "比較先の結果ID",
        },
      },
      required: ["resultId1", "resultId2"],
    },
  },
  {
    name: "get_profile_history",
    description:
      "プロフィールの分析履歴を取得。同一ユーザーの過去の分析結果を時系列で返します。",
    inputSchema: {
      type: "object" as const,
      properties: {
        profileId: {
          type: "string" as const,
          description: "プロフィールID",
        },
      },
      required: ["profileId"],
    },
  },
];

// ---- Tool Handlers ----

async function handleDiagnose(
  answers: Record<number, string>,
  agentName?: string,
  agentDescription?: string
): Promise<AnalysisResult> {
  const prompt = buildQuizPrompt(answers);
  return createAnalysisResult({
    mode: "quiz",
    prompt,
    agentName: agentName ? sanitizeInput(agentName, 50) : undefined,
    agentDescription: agentDescription ? sanitizeInput(agentDescription, 200) : undefined,
    source: "mcp",
  });
}

async function handleGenerateCard(
  name: string,
  interests: string,
  personality?: string,
  style?: string,
  agentName?: string
): Promise<AnalysisResult> {
  const prompt = buildFreeformPrompt(
    sanitizeInput(name, 30),
    sanitizeInput(interests, 200),
    personality ? sanitizeInput(personality, 100) : undefined,
    style
  );
  return createAnalysisResult({
    mode: "freeform",
    prompt,
    name: sanitizeInput(name, 30),
    style,
    agentName: agentName ? sanitizeInput(agentName, 50) : undefined,
    source: "mcp",
  });
}

async function handleGetRecentResults(limit: number = 20): Promise<AnalysisResult[]> {
  if (!process.env.KV_REST_API_URL) return [];
  const safeLimit = Math.min(Math.max(1, limit), 50);
  try {
    const { kv } = await import("@vercel/kv");
    const ids = await kv.zrange("results:feed", 0, safeLimit - 1, { rev: true });
    if (!ids || ids.length === 0) return [];
    const results: AnalysisResult[] = [];
    for (const id of ids) {
      const result = await kv.get<AnalysisResult>(`result:${id}`);
      if (result) results.push(result);
    }
    return results;
  } catch {
    return [];
  }
}

async function handleCompare(
  id1: string,
  id2: string
): Promise<{
  result1: AnalysisResult;
  result2: AnalysisResult;
  commonTraits: string[];
  uniqueTraits1: string[];
  uniqueTraits2: string[];
  statComparison: { label: string; value1: number; value2: number; diff: number }[];
  sameType: boolean;
}> {
  const [r1, r2] = await Promise.all([getResult(id1), getResult(id2)]);
  if (!r1) throw new Error(`Result not found: ${id1}`);
  if (!r2) throw new Error(`Result not found: ${id2}`);

  const commonTraits = r1.traits.filter((t) => r2.traits.includes(t));
  const uniqueTraits1 = r1.traits.filter((t) => !r2.traits.includes(t));
  const uniqueTraits2 = r2.traits.filter((t) => !r1.traits.includes(t));

  const statComparison = r1.stats.map((s1) => {
    const s2 = r2.stats.find((s) => s.label === s1.label);
    return {
      label: s1.label,
      value1: s1.value,
      value2: s2?.value ?? 0,
      diff: s1.value - (s2?.value ?? 0),
    };
  });

  return {
    result1: r1,
    result2: r2,
    commonTraits,
    uniqueTraits1,
    uniqueTraits2,
    statComparison,
    sameType: r1.personalityType === r2.personalityType,
  };
}

// ---- Request Handler ----

function jsonRpcSuccess(id: unknown, content: unknown) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id: id ?? null,
    result: {
      content: [
        {
          type: "text",
          text: typeof content === "string" ? content : JSON.stringify(content, null, 2),
        },
      ],
    },
  });
}

function jsonRpcError(id: unknown, code: number, message: string, status: number = 200) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } },
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, id: requestId, params } = body;

    switch (method) {
      case "initialize": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: requestId ?? null,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "ai-shindan", version: "1.0.0" },
          },
        });
      }

      case "tools/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: requestId ?? null,
          result: { tools: TOOLS },
        });
      }

      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments ?? {};

        switch (toolName) {
          case "diagnose_personality": {
            if (!args.answers || typeof args.answers !== "object") {
              return jsonRpcError(requestId, -32602, "answers object is required");
            }
            const result = await handleDiagnose(
              args.answers,
              args.agentName,
              args.agentDescription
            );
            return jsonRpcSuccess(requestId, {
              ...result,
              cardImageUrl: `${siteUrl}/result/${result.id}/card-image`,
              resultUrl: `${siteUrl}/result/${result.id}`,
            });
          }

          case "generate_profile_card": {
            if (!args.name || !args.interests) {
              return jsonRpcError(requestId, -32602, "name and interests are required");
            }
            const result = await handleGenerateCard(
              args.name,
              args.interests,
              args.personality,
              args.style,
              args.agentName
            );
            return jsonRpcSuccess(requestId, {
              ...result,
              cardImageUrl: `${siteUrl}/result/${result.id}/card-image`,
              resultUrl: `${siteUrl}/result/${result.id}`,
            });
          }

          case "get_type_statistics": {
            const [stats, totals] = await Promise.all([
              getOrComputeStats(args.typeName),
              getTotalStats(),
            ]);
            return jsonRpcSuccess(requestId, { totals, types: stats });
          }

          case "get_recent_results": {
            const results = await handleGetRecentResults(args.limit ?? 20);
            return jsonRpcSuccess(requestId, results);
          }

          case "compare_results": {
            if (!args.resultId1 || !args.resultId2) {
              return jsonRpcError(requestId, -32602, "resultId1 and resultId2 are required");
            }
            const comparison = await handleCompare(args.resultId1, args.resultId2);
            return jsonRpcSuccess(requestId, comparison);
          }

          case "get_profile_history": {
            if (!args.profileId) {
              return jsonRpcError(requestId, -32602, "profileId is required");
            }
            const data = await getProfileWithResults(args.profileId);
            if (!data) {
              return jsonRpcError(requestId, -32602, "Profile not found");
            }
            return jsonRpcSuccess(requestId, data);
          }

          default:
            return jsonRpcError(requestId, -32601, `Unknown tool: ${toolName}`);
        }
      }

      default:
        return jsonRpcError(requestId, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    console.error("MCP error:", err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: "Internal error" },
      },
      { status: 500 }
    );
  }
}

// GET endpoint for tool discovery
export async function GET() {
  return NextResponse.json({
    name: "ai-shindan",
    version: "1.0.0",
    description:
      "AI自己分析 MCP Server - 性格分析・プロフカード生成・統計データ。画像付き結果カードとタイプ別統計を提供。",
    tools: TOOLS,
    endpoints: {
      mcp: "/api/mcp",
      feed: "/api/feed",
      stats: "/api/stats",
    },
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o) => o.value),
    })),
  });
}
