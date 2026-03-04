import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ count: 0 });
    }
    const { kv } = await import("@vercel/kv");
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const count = await kv.incr(`likes:shindan:${id}`);
    await kv.zadd("shindan:popular", { score: count, member: id });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ count: 0 });
    }
    const { kv } = await import("@vercel/kv");
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const count = (await kv.get<number>(`likes:shindan:${id}`)) ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
