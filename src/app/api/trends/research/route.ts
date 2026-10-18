import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { researchTrends } from "@/lib/trends/orchestrator";
import { assertWithinLimit, recordUsage } from "@/lib/billing/usage";
import { getUserById } from "@/lib/auth/users";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  query: z.string().min(1).max(200),
  country: z.string().length(2),
  timeframe: z
    .enum(["now 7-d", "today 3-m", "today 12-m", "today 5-y"])
    .optional(),
  force: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    const user = getUserById(userId);
    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    assertWithinLimit(userId, "research");

    const json = await req.json();
    const body = bodySchema.parse(json);

    // Free → google_trends; Pro with personal SerpAPI → serpapi (see resolveProviderForUser).
    const data = await researchTrends({ ...body, userId });
    recordUsage(userId, "research");
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Research failed";
    const status = message.includes("limit") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
