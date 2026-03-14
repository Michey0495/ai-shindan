import { ImageResponse } from "next/og";
import { getResult } from "@/lib/analysis";

export const runtime = "edge";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      { width: 1080, height: 1080 }
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
          flexDirection: "column",
          background: "#000",
          color: "#fff",
          padding: 60,
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
            <span style={{ color: accent, fontSize: 28, fontWeight: 900 }}>
              {"//"}
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              AI自己分析
            </span>
          </div>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            ai-shindan.ezoai.jp
          </span>
        </div>

        {/* Type & Name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: accent,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            {result.personalityType}
          </div>
          {result.name && (
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              {result.name.slice(0, 12)}
            </div>
          )}
          <div style={{ fontSize: 32, fontWeight: 700, color: accent }}>
            {result.title?.slice(0, 20) || ""}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
              marginTop: 12,
            }}
          >
            {result.catchcopy?.slice(0, 40) || ""}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {(result.stats || []).slice(0, 5).map((stat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.5)",
                  width: 100,
                }}
              >
                {stat.label.slice(0, 8)}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 14,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 7,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${stat.value}%`,
                    height: "100%",
                    background: accent,
                    borderRadius: 7,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: accent,
                  fontWeight: 700,
                  width: 36,
                  textAlign: "right",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Traits & Hashtags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
          }}
        >
          {(result.traits || []).slice(0, 5).map((trait, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: accent,
                background: `${accent}15`,
                padding: "6px 16px",
                borderRadius: 999,
              }}
            >
              {trait}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400",
      },
    }
  );
}
