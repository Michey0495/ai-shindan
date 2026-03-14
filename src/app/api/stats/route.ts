import { NextRequest, NextResponse } from "next/server";
import { getOrComputeStats, getTotalStats } from "@/lib/stats";

export async function GET(req: NextRequest) {
  try {
    const typeName = req.nextUrl.searchParams.get("type") ?? undefined;

    const [stats, totals] = await Promise.all([
      getOrComputeStats(typeName),
      getTotalStats(),
    ]);

    return NextResponse.json({
      types: stats,
      totalResults: totals.totalResults,
      uniqueTypes: totals.uniqueTypes,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ types: [], totalResults: 0, uniqueTypes: 0 });
  }
}
