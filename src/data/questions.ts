import { Question } from "@/types";

export const questions: Question[] = [
  {
    id: 1,
    text: "初対面の人との会話で、あなたはどちらに近い？",
    options: [
      { label: "積極的に話しかける", value: "A" },
      { label: "相手が話しかけるのを待つ", value: "B" },
      { label: "共通の話題を探す", value: "C" },
      { label: "様子を見ながら少しずつ話す", value: "D" },
    ],
  },
  {
    id: 2,
    text: "理想の休日の過ごし方は？",
    options: [
      { label: "友人・家族と賑やかに過ごす", value: "A" },
      { label: "一人でゆっくり趣味を楽しむ", value: "B" },
      { label: "新しい場所や体験を探しに行く", value: "C" },
      { label: "計画どおりに有意義な時間を過ごす", value: "D" },
    ],
  },
  {
    id: 3,
    text: "問題が起きたとき、まず何をする？",
    options: [
      { label: "すぐに行動して解決しようとする", value: "A" },
      { label: "一人で冷静に原因を分析する", value: "B" },
      { label: "誰かに相談して意見をもらう", value: "C" },
      { label: "最悪のケースを想定してから動く", value: "D" },
    ],
  },
  {
    id: 4,
    text: "グループ作業での自分の役割は？",
    options: [
      { label: "リーダーとしてみんなをまとめる", value: "A" },
      { label: "黙々と自分の担当を仕上げる", value: "B" },
      { label: "全体のムードを盛り上げる", value: "C" },
      { label: "計画・段取りを整理する", value: "D" },
    ],
  },
  {
    id: 5,
    text: "大きな決断をするとき、どうする？",
    options: [
      { label: "直感を信じてすぐ決める", value: "A" },
      { label: "データや事実を徹底的に調べる", value: "B" },
      { label: "信頼できる人に意見を聞く", value: "C" },
      { label: "メリット・デメリットを書き出す", value: "D" },
    ],
  },
  {
    id: 6,
    text: "感情について、あなたはどちらに近い？",
    options: [
      { label: "感情を率直に表現する", value: "A" },
      { label: "感情はあまり外に出さない", value: "B" },
      { label: "相手の気持ちに敏感に反応する", value: "C" },
      { label: "感情より論理を優先する", value: "D" },
    ],
  },
  {
    id: 7,
    text: "新しいことへの挑戦は？",
    options: [
      { label: "大好き！すぐに飛び込む", value: "A" },
      { label: "慎重に準備してから始める", value: "B" },
      { label: "楽しそうなら積極的に参加", value: "C" },
      { label: "リスクを見極めてから判断", value: "D" },
    ],
  },
  {
    id: 8,
    text: "締め切りや期限に対して、あなたは？",
    options: [
      { label: "プレッシャーで実力を発揮する", value: "A" },
      { label: "前倒しで余裕を持って終わらせる", value: "B" },
      { label: "ギリギリになりがち…でも何とかなる", value: "C" },
      { label: "スケジュール管理は得意なほう", value: "D" },
    ],
  },
  {
    id: 9,
    text: "ストレスを感じたとき、どう解消する？",
    options: [
      { label: "誰かと話して発散する", value: "A" },
      { label: "一人の時間でリセットする", value: "B" },
      { label: "体を動かしてリフレッシュ", value: "C" },
      { label: "好きなことに没頭する", value: "D" },
    ],
  },
  {
    id: 10,
    text: "5年後の自分に最も近いイメージは？",
    options: [
      { label: "多くの人を率いてプロジェクトを動かす", value: "A" },
      { label: "専門分野で深い知識・スキルを持つ", value: "B" },
      { label: "人との繋がりを大切にしながら活躍する", value: "C" },
      { label: "安定した環境で着実に成果を出す", value: "D" },
    ],
  },
];
