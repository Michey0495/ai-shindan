export interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
}

export interface DiagnosisResult {
  id: string;
  personalityType: string;
  description: string;
  traits: string[];
  colorScheme: "red" | "blue" | "green" | "purple" | "yellow" | "pink";
  advice: string;
  createdAt: number;
  agentName?: string;
  agentDescription?: string;
  source?: "web" | "mcp";
  shareText?: string;
}

export interface DiagnoseRequest {
  answers: Record<number, string>;
  agentName?: string;
  agentDescription?: string;
  source?: "web" | "mcp";
}

export interface FeedItem {
  id: string;
  personalityType: string;
  agentName?: string;
  traits: string[];
  colorScheme: string;
  createdAt: number;
}
