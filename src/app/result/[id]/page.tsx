import { notFound } from "next/navigation";
import { Metadata } from "next";
import ResultCard from "@/components/ResultCard";
import { getResult } from "@/lib/analysis";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return { title: "結果が見つかりません - AI自己分析" };
  }

  const title = result.name
    ? `${result.name}の自己分析: ${result.personalityType}`
    : `${result.personalityType} - AI自己分析`;
  const desc = result.catchcopy || result.description;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${siteUrl}/result/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <ResultCard result={result} />
    </div>
  );
}
