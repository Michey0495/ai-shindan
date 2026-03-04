# ARCHITECTURE.md — AI性格診断

## 概要

AI性格診断は、SNSバイラル特化のパーソナリティ診断アプリ。
10問の質問 → Claude AI分析 → シェアしやすい結果カード、のシンプルな1方向フロー。

## ページ構成

```
/                    ← トップ（CTA）
/quiz               ← クライアントコンポーネント（質問ステッパー）
/result/[id]        ← サーバーコンポーネント（KVから結果取得）
```

## データフロー

```
User → /quiz (client)
  ↓ POST /api/diagnose { answers: {1: "A", 2: "C", ...} }
  ↓ Claude Haiku: 回答を分析 → JSON返却
  ↓ Vercel KV: result:${id} に30日保存
  ↓ redirect /result/${id}
  ↓ Server Component: KVから取得して表示
```

## AI プロンプト設計

Claude Haikuに回答データを渡し、以下を返却させる：
- `personalityType`: ユニークな性格タイプ名
- `emoji`: タイプを表す絵文字
- `description`: 120-150文字の説明
- `traits`: 特徴タグ（5つ）
- `colorScheme`: カードのカラー（red/blue/green/purple/yellow/pink）
- `advice`: AIからのアドバイス（80-100文字）

JSON only返却を強制することでパース安定性を確保。

## コンポーネント設計

```
src/
├── app/
│   ├── layout.tsx          ← 共通メタデータ、Toaster
│   ├── page.tsx            ← トップページ（Server）
│   ├── quiz/
│   │   └── page.tsx        ← クイズ（Client）
│   ├── result/[id]/
│   │   └── page.tsx        ← 結果（Server + OGP動的生成）
│   └── api/diagnose/
│       └── route.ts        ← API Route
├── components/
│   ├── ResultCard.tsx      ← 結果カード（Client: シェアボタン）
│   └── ui/                 ← shadcn/ui
├── data/
│   └── questions.ts        ← 10問の質問データ
└── types/
    └── index.ts            ← 型定義
```

## バイラル設計

1. **OGP動的生成**: `/result/[id]` でKVから結果を取得しOGP出力
2. **SNSシェアボタン**: X(Twitter), LINE, リンクコピー
3. **URLシェア**: 結果URLが永続（30日間）→ 友人が同じ結果を見られる
4. **カード見た目**: グラデーションカラー + 絵文字 + バッジで映える

## 技術的な決断

- **Client vs Server**: クイズはstate管理のためClient、結果はSEO・OGPのためServer
- **KV有効期限**: 30日（診断結果のシェア期間として十分）
- **ID生成**: nanoid(10) で衝突確率が極めて低く短いURL
- **AIモデル**: Claude Haiku（速度・コスト優先。診断は単純なJSON生成）
