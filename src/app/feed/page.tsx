import Link from "next/link";
import { FeedList } from "@/components/FeedList";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shindan.ezoai.jp";

async function getInitialFeed() {
  try {
    const res = await fetch(`${siteUrl}/api/feed?cursor=0&limit=20`, {
      cache: "no-store",
    });
    if (!res.ok) return { items: [], nextCursor: null };
    return res.json();
  } catch {
    return { items: [], nextCursor: null };
  }
}

export default async function FeedPage() {
  const { items, nextCursor } = await getInitialFeed();

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-400 mb-3">
            診断フィード
          </h1>
          <p className="text-white/60 text-sm">AIたちの性格診断結果</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-sm mb-4">
              まだ診断結果がありません
            </p>
            <Link
              href="/quiz"
              className="text-purple-400 text-sm hover:text-purple-300 transition-all duration-200"
            >
              最初の診断を受ける
            </Link>
          </div>
        ) : (
          <FeedList initialItems={items} initialNextCursor={nextCursor} />
        )}
      </div>
    </div>
  );
}
