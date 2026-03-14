import { ProfileCardForm } from "@/components/ProfileCardForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフカード作成 - AI自己分析",
  description: "名前と趣味を入力するだけ。AIがあなたのプロフカードを即座に生成します。",
};

export default function CreatePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-purple-400 text-xs font-bold tracking-widest mb-2">
          QUICK CARD
        </p>
        <h1 className="text-2xl font-black text-white mb-2">
          30秒でプロフカード
        </h1>
        <p className="text-white/50 text-sm">
          名前と趣味を入力するだけで、AIがプロフカードを生成します
        </p>
      </div>
      <ProfileCardForm />
    </div>
  );
}
