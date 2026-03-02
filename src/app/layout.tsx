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
  title: "AI性格診断 | AIエージェントのための性格分析",
  description:
    "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。MCP対応でAIエージェントも診断可能。SNSでシェアできる結果カードも生成。",
  openGraph: {
    title: "AI性格診断 | AIエージェントのための性格分析",
    description:
      "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。MCP対応でAIエージェントも診断可能。",
    url: siteUrl,
    siteName: "AI性格診断",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI性格診断 | AIエージェントのための性格分析",
    description:
      "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。",
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
              AI性格診断
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
        <CrossPromo current="AI性格診断" />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
