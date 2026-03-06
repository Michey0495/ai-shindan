"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-sm hover:text-purple-400 transition-colors"
        >
          <span className="text-purple-400 font-mono text-xs">AI</span>
          <span>性格診断</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/feed"
            className={`text-sm transition-colors ${
              pathname === "/feed"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            みんなの診断
          </Link>
          <Link
            href="/quiz"
            className={`text-sm transition-colors ${
              pathname === "/quiz"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            診断する
          </Link>
        </div>
      </div>
    </nav>
  );
}
