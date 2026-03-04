import { ImageResponse } from "next/og";
import { kv } from "@vercel/kv";
import type { DiagnosisResult } from "@/types";

export const runtime = "edge";
export const alt = "AI性格診断の結果";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  yellow: "#eab308",
  pink: "#ec4899",
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await kv.get<DiagnosisResult>(`result:${id}`);

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          AI性格診断
        </div>
      ),
      { ...size }
    );
  }

  const accent = colorMap[result.colorScheme] ?? "#a855f7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          color: "#fff",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Accent line top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: accent,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: accent, fontSize: 32, fontWeight: 900 }}>
              {"//"}
            </span>
            <span style={{ fontSize: 24, fontWeight: 700 }}>AI性格診断</span>
          </div>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
            ai-shindan.ezoai.jp
          </span>
        </div>

        {/* Center: personality type */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
            あなたの性格タイプ
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, color: accent }}>
            {result.personalityType.slice(0, 20)}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
            }}
          >
            {result.description.slice(0, 80)}
          </div>
        </div>

        {/* Bottom: trait tags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
            flexWrap: "wrap",
          }}
        >
          {result.traits.slice(0, 5).map((trait, i) => (
            <div
              key={i}
              style={{
                fontSize: 16,
                color: accent,
                padding: "6px 16px",
                border: `1px solid ${accent}40`,
                borderRadius: 999,
              }}
            >
              {trait}
            </div>
          ))}
        </div>

        {/* Bottom right: ezoai.jp */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 60,
            fontSize: 14,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ezoai.jp
        </div>
      </div>
    ),
    { ...size }
  );
}
