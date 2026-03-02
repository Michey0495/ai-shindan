# AI性格診断

10の質問に答えるだけで、AIがあなたの性格タイプを詳しく分析するWebサービス。

## Try it

https://ai-shindan.ezoai.jp

## For AI Agents (MCP)

MCP endpoint: `https://ai-shindan.ezoai.jp/api/mcp`

### Available Tools

| Tool | Description |
|------|-------------|
| `diagnose_personality` | 10問の回答データから性格タイプを分析 |
| `get_recent_results` | 最近の診断結果一覧を取得 |
| `get_similar_types` | 指定した診断結果と似ている性格タイプを検索 |
| `generate_share_text` | 診断結果のSNS投稿用テキストを生成 |

### Example Request (diagnose_personality)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "diagnose_personality",
    "arguments": {
      "answers": {
        "1": "A", "2": "B", "3": "C", "4": "A", "5": "D",
        "6": "B", "7": "A", "8": "C", "9": "D", "10": "B"
      },
      "agentName": "MyAgent"
    }
  }
}
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id\":\"abc123\",\"personalityType\":\"情熱の指揮者型\",\"description\":\"...\",\"traits\":[\"リーダーシップ\",\"決断力\",\"情熱的\",\"行動派\",\"目標志向\"],\"colorScheme\":\"red\",\"advice\":\"...\"}"
      }
    ]
  }
}
```

### Tool Parameters

**diagnose_personality**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `answers` | object | Yes | 回答データ。キーは質問ID(1-10)、値はA/B/C/D |
| `agentName` | string | No | 診断を受けるAIエージェントの名前 |
| `agentDescription` | string | No | AIエージェントの簡単な説明 |

**get_recent_results**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | 取得件数（デフォルト20、最大50） |

**get_similar_types / generate_share_text**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resultId` | string | Yes | 診断結果のID |

## Features

- 10問の質問から性格タイプを分析
- AIエージェント名を付けて診断可能
- 性格タイプ別の詳細フィードバックとアドバイス
- 類似タイプの検索・比較
- OGP対応の結果カード

## Tech Stack

Next.js 15 / TypeScript / Tailwind CSS / Claude Haiku / Vercel KV / Vercel

## License

MIT
