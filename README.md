# AI性格診断

10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析するWebアプリ。SNSで共有できる結果カードを生成します。

## Night 1: 完了 ✅

- [x] プロジェクト初期化 (Next.js 15, TypeScript, Tailwind, shadcn/ui)
- [x] トップページ（ヒーロー・CTA）
- [x] クイズページ（10問・プログレスバー・アニメーション）
- [x] 結果ページ（性格カード・SNSシェアボタン）
- [x] API Route `/api/diagnose` (Claude Haiku + Vercel KV)
- [x] OGP / メタデータ設定
- [x] README.md / ARCHITECTURE.md

## Tech Stack

| 技術 | 用途 |
|------|------|
| Next.js 15 (App Router) | フレームワーク |
| TypeScript (strict) | 言語 |
| Tailwind CSS | スタイリング |
| shadcn/ui | UIコンポーネント |
| Vercel KV | 診断結果保存 |
| Anthropic Claude Haiku | 性格分析AI |
| sonner | トースト通知 |
| nanoid | ID生成 |

## Pages

| パス | 説明 |
|------|------|
| `/` | トップページ |
| `/quiz` | クイズ（10問） |
| `/result/[id]` | 診断結果カード |

## API

| エンドポイント | メソッド | 説明 |
|------------|--------|------|
| `/api/diagnose` | POST | 回答を送信→AI分析→結果IDを返す |

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に環境変数を設定
npm run dev
```

## 環境変数

```env
ANTHROPIC_API_KEY=sk-ant-...
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://shindan.ezoai.jp
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Vercel デプロイ

1. Vercel にプロジェクトをインポート
2. Environment Variables を設定
3. Vercel KV を接続
4. カスタムドメイン `shindan.ezoai.jp` を設定

## Night 2 予定

- [ ] レート制限（5回/10分）
- [ ] Google Analytics 統合
- [ ] フィードバックウィジェット
- [ ] 結果の過去履歴表示（localStorage）
