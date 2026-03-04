import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
      <div className="text-center">
        <p className="text-purple-400 text-sm font-bold mb-2">{"// 404"}</p>
        <h1 className="text-4xl font-black text-white mb-4">
          ページが見つかりません
        </h1>
        <p className="text-white/50 text-sm mb-8">
          お探しのページは存在しないか、削除された可能性があります。
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400 transition-all duration-200 cursor-pointer"
          >
            トップへ戻る
          </Link>
          <Link
            href="/feed"
            className="px-6 py-2.5 bg-white/5 text-white/70 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            フィードを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
