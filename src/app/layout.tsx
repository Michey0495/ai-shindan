import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Nav } from "@/components/Nav";
import CrossPromo from "@/components/CrossPromo";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-shindan.ezoai.jp";

export const metadata: Metadata = {
  title: {
    default: "AI性格診断 - あなたの本当の性格を発見しよう",
    template: "%s | AI性格診断",
  },
  description:
    "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。SNSでシェアできる結果カードも生成。登録不要・無料。",
  keywords: [
    "AI性格診断",
    "性格タイプ",
    "AI診断",
    "性格分析",
    "personality test",
    "AI",
    "無料診断",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "AI性格診断",
    url: siteUrl,
    title: "AI性格診断 - あなたの本当の性格を発見しよう",
    description:
      "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI性格診断 - あなたの本当の性格を発見しよう",
    description:
      "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI性格診断",
  url: siteUrl,
  description:
    "10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析するWebアプリ。",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geist.className} antialiased min-h-screen bg-black text-white`}
      >
        <a
          href="https://ezoai.jp"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 border-b border-white/5 py-1.5 text-center text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          ezoai.jp -- 7つのAIサービスを無料で体験
        </a>
        <Nav />
        <main>{children}</main>
        <CrossPromo current="AI性格診断" />
        <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30">
          <p>© 2026 AI性格診断</p>
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
