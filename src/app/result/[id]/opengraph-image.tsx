import { ImageResponse } from "next/og";
import { getResult } from "@/lib/analysis";

export const runtime = "edge";
export const alt = "AI自己分析 結果カード";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const accentColors: Record<string, string> = {
  cool: "#38bdf8",
  cute: "#f472b6",
  dark: "#a78bfa",
  creative: "#fbbf24",
  red: "#f87171",
  blue: "#60a5fa",
  green: "#34d399",
  purple: "#a78bfa",
  yellow: "#fbbf24",
  pink: "#f472b6",
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);

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
          AI自己分析
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const accent = accentColors[result.style ?? result.colorScheme] ?? "#a78bfa";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#000",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Top accent line */}
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

        {/* Left: Text info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 48px 48px 56px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <span style={{ color: accent, fontSize: 22, fontWeight: 900 }}>
              {"//"}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              AI自己分析
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              color: accent,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            {result.personalityType}
          </div>

          {result.name && (
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              {result.name.slice(0, 12)}
            </div>
          )}

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: accent,
              marginBottom: 12,
            }}
          >
            {result.title?.slice(0, 20) || ""}
          </div>

          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 24,
            }}
          >
            {result.catchcopy?.slice(0, 50) || ""}
          </div>

          {/* Traits */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(result.traits || []).slice(0, 4).map((trait, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: accent,
                  background: `${accent}18`,
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
            padding: "48px 56px 48px 0",
            width: 400,
          }}
        >
          {(result.stats || []).slice(0, 5).map((stat, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  width: 72,
                }}
              >
                {stat.label.slice(0, 6)}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 12,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${stat.value}%`,
                    height: "100%",
                    background: accent,
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: accent,
                  fontWeight: 700,
                  width: 28,
                  textAlign: "right",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 56,
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ai-shindan.ezoai.jp
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
