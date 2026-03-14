import type { UserProfile, AnalysisResult } from "@/types";

export async function getProfile(profileId: string): Promise<UserProfile | null> {
  if (!process.env.KV_REST_API_URL) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return await kv.get<UserProfile>(`profile:${profileId}`);
  } catch {
    return null;
  }
}

export async function addResultToProfile(
  profileId: string,
  resultId: string,
  name?: string
): Promise<void> {
  if (!process.env.KV_REST_API_URL) return;
  try {
    const { kv } = await import("@vercel/kv");
    const existing = await kv.get<UserProfile>(`profile:${profileId}`);
    if (existing) {
      existing.results.push(resultId);
      existing.lastSeenAt = Date.now();
      if (name && !existing.name) existing.name = name;
      await kv.set(`profile:${profileId}`, existing, { ex: 60 * 60 * 24 * 365 });
    } else {
      const profile: UserProfile = {
        id: profileId,
        name,
        results: [resultId],
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
      };
      await kv.set(`profile:${profileId}`, profile, { ex: 60 * 60 * 24 * 365 });
    }
  } catch (e) {
    console.error("Profile update error:", e);
  }
}

export async function getProfileWithResults(
  profileId: string
): Promise<{ profile: UserProfile; results: AnalysisResult[] } | null> {
  if (!process.env.KV_REST_API_URL) return null;
  try {
    const { kv } = await import("@vercel/kv");
    const profile = await kv.get<UserProfile>(`profile:${profileId}`);
    if (!profile) return null;

    const results: AnalysisResult[] = [];
    for (const rid of profile.results.slice(-20)) {
      const r = await kv.get<AnalysisResult>(`result:${rid}`);
      if (r) results.push(r);
    }

    return { profile, results };
  } catch {
    return null;
  }
}
