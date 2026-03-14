import { NextRequest, NextResponse } from "next/server";
import { buildQuizPrompt, createAnalysisResult } from "@/lib/analysis";
import type { DiagnoseRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: DiagnoseRequest = await req.json();
    const { answers, agentName, agentDescription, source, profileId } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const prompt = buildQuizPrompt(answers);

    const result = await createAnalysisResult({
      mode: "quiz",
      prompt,
      agentName,
      agentDescription,
      source: source ?? "web",
      profileId,
    });

    return NextResponse.json({ id: result.id, shareText: result.shareText });
  } catch (err) {
    console.error("Diagnose error:", err);
    return NextResponse.json(
      { error: "診断処理に失敗しました" },
      { status: 500 }
    );
  }
}
