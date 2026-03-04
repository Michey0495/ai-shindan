import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import type { Metadata } from "next";
import type { DiagnosisResult } from "@/types";
import ResultCard from "@/components/ResultCard";
import { LikeButton } from "@/components/LikeButton";

const colorMap: Record<string, { from: string; to: string; text: string }> = {
  red: { from: "from-red-500", to: "to-orange-500", text: "text-red-400" },
  blue: { from: "from-blue-500", to: "to-cyan-500", text: "text-blue-400" },
  green: { from: "from-green-500", to: "to-emerald-500", text: "text-green-400" },
  purple: { from: "from-purple-500", to: "to-pink-500", text: "text-purple-400" },
  yellow: { from: "from-yellow-500", to: "to-amber-500", text: "text-yellow-400" },
  pink: { from: "from-pink-500", to: "to-rose-500", text: "text-pink-400" },
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shindan.ezoai.jp";
  try {
    const result = await kv.get<DiagnosisResult>(`result:${id}`);
    if (!result) return {};
    return {
      title: `${result.emoji} ${result.personalityType} | AI性格診断`,
      description: result.description,
      openGraph: {
        title: `私の性格タイプは「${result.personalityType}」でした！`,
        description: result.description,
        url: `${siteUrl}/result/${id}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `私の性格タイプは「${result.personalityType}」でした！`,
        description: result.description,
      },
    };
  } catch {
    return {};
  }
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  let result: DiagnosisResult | null = null;

  try {
    result = await kv.get<DiagnosisResult>(`result:${id}`);
  } catch {
    // KV not available in dev — use placeholder
  }

  if (!result) {
    notFound();
  }

  const colors = colorMap[result.colorScheme] ?? colorMap.purple;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      <ResultCard result={result} colors={colors} />
      <div className="mt-4">
        <LikeButton id={id} />
      </div>
    </div>
  );
}
