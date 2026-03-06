# Pro Critic Review: AI性格診断
## Date: 2026-03-04
## Review: #001 (Initial)
## Overall Score: 56/100

---

### Category Scores

| Category | Score | Details |
|----------|-------|---------|
| ブラウザアプリ完成度 | 12/20 | robots.ts未実装。JSON-LD未実装。OG画像参照なし(layout)。keywords/canonical/robots metadata未設定。`<html>`にdarkクラスなし。Navなし。CrossPromoがlayoutにない。footerなし。URL: `shindan.ezoai.jp` vs agent.jsonの`ai-shindan.ezoai.jp`不統一 |
| UI/UXデザイン | 14/20 | ヒーローの紫グラデーション良好。3ステップカードはShindanMaker風。結果カードのグラデーション枠は視覚的。問題: Navなし。ResultCardに絵文字表示(CLAUDE.md違反)。「💡 AIからのアドバイス」に絵文字。gray-950/gray-500等の非黒カラーが混在。LikeButtonの表示バグ(liked/unliked同じ文字) |
| システム設計 | 10/20 | 致命的: **本番AI生成不能**(Ollama localhost)。`/api/diagnose`にレート制限なし。MCPにレート制限なし。AI生成ロジックが`/api/diagnose`と`/api/mcp`で重複。MCP promptにemoji fieldなし(Web版にはある→出力不整合)。bodyparse try/catchなし(diagnose route) |
| AIエージェント導線 | 15/20 | agent.jsonが比較的充実(tools/protocol/auth)。MCP initialize実装済み。4つのツール(diagnose/recent/similar/share)で機能豊富。問題: robots.ts未実装。llms.txtに3ステップフロー未記載。MCPにレート制限なし。URL不統一 |
| 人間エンタメ体験 | 5/20 | 致命的: **本番AI動作不能**で診断自体が成立しない。コンセプトは良い(性格診断=高シェア率)。結果カードのグラデーション枠はSNS映え。問題: 絵文字依存(診断結果の核がemoji)でCLAUDE.md違反。エンプティステート未対応 |

---

### Critical Issues (P0)

1. **本番AI生成不能**: Ollama localhost。Anthropicフォールバック必須
2. **レート制限なし**: `/api/diagnose`、MCPともにレート制限なし
3. **robots.ts未実装**: ファイル自体が存在しない
4. **絵文字違反**: AI promptでemoji生成指示、ResultCardで絵文字表示、「💡」ハードコード

### Major Issues (P1)

5. **Navなし**: グローバルナビゲーション
6. **JSON-LD未実装**
7. **layout.tsx**: dark class、OG画像、keywords、canonical、robots metadata全て欠落
8. **AI共通モジュールなし**: 生成ロジック重複
9. **llms.txt**: 3ステップフロー未記載
10. **CrossPromo**: layoutになし

---

### Score Breakdown

```
ブラウザアプリ完成度:  12/20
UI/UXデザイン:        14/20
システム設計:          10/20
AIエージェント導線:    15/20
人間エンタメ体験:       5/20
──────────────────────
合計:                  56/100
```
