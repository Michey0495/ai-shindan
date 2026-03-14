import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import CrossPromo from "@/components/CrossPromo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shindan.ezoai.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI自己分析 | 性格タイプ・能力値・プロフカード",
  description:
    "AIが性格タイプ・能力値・二つ名を分析。ビジュアルカード画像生成、タイプ統計、プロフィール保存。MCP対応でAIエージェントも利用可能。",
  openGraph: {
    title: "AI自己分析 | 性格タイプ・能力値・プロフカード",
    description:
      "AIが性格タイプ・能力値・二つ名を分析。ビジュアルカード画像生成、タイプ統計、プロフィール保存。",
    url: siteUrl,
    siteName: "AI自己分析",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI自己分析 | 性格タイプ・能力値・プロフカード",
    description:
      "AIが性格タイプ・能力値・二つ名を分析。ビジュアルカード画像・統計データ・プロフィール保存。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased min-h-screen`}>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-6">
            <Link
              href="/"
              className="text-white/60 text-sm font-bold hover:text-white transition-all duration-200"
            >
              AI自己分析
            </Link>
            <Link
              href="/create"
              className="text-white/40 text-sm hover:text-white/60 transition-all duration-200"
            >
              作成
            </Link>
            <Link
              href="/stats"
              className="text-white/40 text-sm hover:text-white/60 transition-all duration-200"
            >
              統計
            </Link>
            <Link
              href="/feed"
              className="text-white/40 text-sm hover:text-white/60 transition-all duration-200"
            >
              フィード
            </Link>
          </div>
        </nav>
        {children}
        <CrossPromo current="AI自己分析" />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
