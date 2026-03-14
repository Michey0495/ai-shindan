export type CardStyle = "cool" | "cute" | "dark" | "creative";

export interface StyleTheme {
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentHex: string;
  tagBg: string;
  tagText: string;
  tagBorder: string;
  buttonBg: string;
  buttonHover: string;
  barColor: string;
}

export const styleThemes: Record<CardStyle, StyleTheme> = {
  cool: {
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
    accentBorder: "border-sky-400/20",
    accentHex: "#38bdf8",
    tagBg: "bg-sky-500/10",
    tagText: "text-sky-400",
    tagBorder: "border-sky-400/20",
    buttonBg: "bg-sky-500",
    buttonHover: "hover:bg-sky-600",
    barColor: "bg-sky-400",
  },
  cute: {
    accent: "text-pink-400",
    accentBg: "bg-pink-500/10",
    accentBorder: "border-pink-400/20",
    accentHex: "#f472b6",
    tagBg: "bg-pink-500/10",
    tagText: "text-pink-400",
    tagBorder: "border-pink-400/20",
    buttonBg: "bg-pink-500",
    buttonHover: "hover:bg-pink-600",
    barColor: "bg-pink-400",
  },
  dark: {
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-400/20",
    accentHex: "#a78bfa",
    tagBg: "bg-violet-500/10",
    tagText: "text-violet-400",
    tagBorder: "border-violet-400/20",
    buttonBg: "bg-violet-500",
    buttonHover: "hover:bg-violet-600",
    barColor: "bg-violet-400",
  },
  creative: {
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-400/20",
    accentHex: "#fbbf24",
    tagBg: "bg-amber-500/10",
    tagText: "text-amber-400",
    tagBorder: "border-amber-400/20",
    buttonBg: "bg-amber-500",
    buttonHover: "hover:bg-amber-600",
    barColor: "bg-amber-400",
  },
};

export function getTheme(style?: string): StyleTheme {
  return styleThemes[(style as CardStyle)] ?? styleThemes.cool;
}
