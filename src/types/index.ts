export interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
}

export interface ProfileStat {
  label: string;
  value: number;
}

export type ColorScheme = "red" | "blue" | "green" | "purple" | "yellow" | "pink";

export interface AnalysisResult {
  id: string;

  // Identity
  name?: string;
  agentName?: string;
  agentDescription?: string;

  // Core analysis
  personalityType: string;
  title: string;
  catchcopy: string;
  description: string;

  // Structured data
  traits: string[];
  stats: ProfileStat[];
  hashtags: string[];
  colorScheme: ColorScheme;

  // Advice
  advice: string;

  // Metadata
  source: "web" | "mcp";
  mode: "quiz" | "freeform";
  style?: string;
  createdAt: number;
  profileId?: string;
  shareText?: string;
}

// Legacy compatibility
export type DiagnosisResult = AnalysisResult;

export interface DiagnoseRequest {
  answers: Record<number, string>;
  agentName?: string;
  agentDescription?: string;
  source?: "web" | "mcp";
  profileId?: string;
}

export interface FeedItem {
  id: string;
  personalityType: string;
  title?: string;
  name?: string;
  agentName?: string;
  traits: string[];
  stats?: ProfileStat[];
  colorScheme: string;
  createdAt: number;
  likes?: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  results: string[];
  createdAt: number;
  lastSeenAt: number;
}

export interface TypeStats {
  type: string;
  count: number;
  avgStats: ProfileStat[];
  commonTraits: string[];
  percentage: number;
}
