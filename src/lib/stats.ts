import type { ProfileStat, TypeStats } from "@/types";

export async function incrementTypeStat(
  typeName: string,
  stats: ProfileStat[],
  traits: string[]
): Promise<void> {
  if (!process.env.KV_REST_API_URL) return;
  try {
    const { kv } = await import("@vercel/kv");
    const normalized = typeName.trim();
    await kv.hincrby("stats:type_counts", normalized, 1);
    const dataPoint = JSON.stringify({ stats, traits, timestamp: Date.now() });
    const listKey = `stats:type_data:${normalized}`;
    await kv.lpush(listKey, dataPoint);
    await kv.ltrim(listKey, 0, 99);
  } catch (e) {
    console.error("Stats increment error:", e);
  }
}

export async function getOrComputeStats(typeName?: string): Promise<TypeStats[]> {
  if (!process.env.KV_REST_API_URL) return [];
  try {
    const { kv } = await import("@vercel/kv");

    if (typeName) {
      const cached = await kv.get<TypeStats>(`typestats:${typeName}`);
      if (cached) return [cached];
      const computed = await computeTypeStats(kv, typeName);
      if (computed) {
        await kv.set(`typestats:${typeName}`, computed, { ex: 3600 });
        return [computed];
      }
      return [];
    }

    const cached = await kv.get<TypeStats[]>("typestats:all");
    if (cached) return cached;

    const allCounts = await kv.hgetall<Record<string, number>>("stats:type_counts");
    if (!allCounts || Object.keys(allCounts).length === 0) return [];

    const totalCount = Object.values(allCounts).reduce((a, b) => a + Number(b), 0);
    const results: TypeStats[] = [];

    for (const [type, count] of Object.entries(allCounts)) {
      const computed = await computeTypeStats(kv, type, Number(count), totalCount);
      if (computed) results.push(computed);
    }

    results.sort((a, b) => b.count - a.count);
    await kv.set("typestats:all", results, { ex: 3600 });
    return results;
  } catch (e) {
    console.error("Stats compute error:", e);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function computeTypeStats(
  kv: any,
  typeName: string,
  count?: number,
  totalCount?: number
): Promise<TypeStats | null> {
  try {
    if (count === undefined) {
      const c = await kv.hget("stats:type_counts", typeName);
      count = Number(c) || 0;
    }
    if (count === 0) return null;

    if (totalCount === undefined) {
      const all = await kv.hgetall("stats:type_counts") as Record<string, number> | null;
      totalCount = all ? Object.values(all).reduce((a, b) => a + Number(b), 0) : count;
    }

    const rawData = await kv.lrange(`stats:type_data:${typeName}`, 0, 99);
    if (!rawData || rawData.length === 0) {
      return {
        type: typeName,
        count,
        avgStats: [],
        commonTraits: [],
        percentage: Math.round((count / totalCount) * 100),
      };
    }

    const entries = rawData.map((r: string) => {
      try { return typeof r === "string" ? JSON.parse(r) : r; } catch { return null; }
    }).filter(Boolean);

    // Average stats
    const statSums: Record<string, { total: number; count: number }> = {};
    for (const entry of entries) {
      if (!Array.isArray(entry.stats)) continue;
      for (const s of entry.stats) {
        if (!statSums[s.label]) statSums[s.label] = { total: 0, count: 0 };
        statSums[s.label].total += Number(s.value) || 0;
        statSums[s.label].count++;
      }
    }
    const avgStats: ProfileStat[] = Object.entries(statSums)
      .map(([label, { total, count: c }]) => ({ label, value: Math.round(total / c) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Common traits
    const traitCounts: Record<string, number> = {};
    for (const entry of entries) {
      if (!Array.isArray(entry.traits)) continue;
      for (const t of entry.traits) {
        traitCounts[t] = (traitCounts[t] || 0) + 1;
      }
    }
    const commonTraits = Object.entries(traitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);

    return {
      type: typeName,
      count,
      avgStats,
      commonTraits,
      percentage: Math.round((count / totalCount) * 100),
    };
  } catch {
    return null;
  }
}

export async function getTotalStats(): Promise<{ totalResults: number; uniqueTypes: number }> {
  if (!process.env.KV_REST_API_URL) return { totalResults: 0, uniqueTypes: 0 };
  try {
    const { kv } = await import("@vercel/kv");
    const allCounts = await kv.hgetall<Record<string, number>>("stats:type_counts");
    if (!allCounts) return { totalResults: 0, uniqueTypes: 0 };
    const totalResults = Object.values(allCounts).reduce((a, b) => a + Number(b), 0);
    return { totalResults, uniqueTypes: Object.keys(allCounts).length };
  } catch {
    return { totalResults: 0, uniqueTypes: 0 };
  }
}
