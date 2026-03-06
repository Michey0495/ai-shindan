import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI性格診断 - あなたの本当の性格を発見しよう";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.15), transparent)",
          }}
        />
        <div
          style={{
            fontSize: 14,
            color: "rgba(167,139,250,0.8)",
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            fontFamily: "monospace",
            marginBottom: 16,
          }}
        >
          AI Personality Test
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
          }}
        >
          AI性格診断
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 600,
            textAlign: "center" as const,
            marginTop: 16,
          }}
        >
          10の質問に答えるだけ。AIがあなたの本当の性格を分析
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ai-shindan.ezoai.jp
        </div>
      </div>
    ),
    size
  );
}
