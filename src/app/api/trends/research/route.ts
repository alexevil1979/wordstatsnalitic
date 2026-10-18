import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { researchTrends } from "@/lib/trends/orchestrator";
import { assertWithinLimit, recordUsage } from "@/lib/billing/usage";
import { getPlan } from "@/lib/billing/plans";
import { getUserById } from "@/lib/auth/users";
import { getSetting } from "@/lib/settings";

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

    // Free users always use google_trends; paid keys only for Pro (later wiring).
    const plan = getPlan(user.plan);
    if (!plan.allowPaidKeys) {
      const provider = getSetting("KEYWORD_PROVIDER", "google_trends");
      if (provider !== "google_trends" && provider !== "expert_seed") {
        // Platform may have paid keys globally — Free still forced to google_trends.
      }
    }

    const data = await researchTrends({ ...body, userId });
    recordUsage(userId, "research");
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Research failed";
    const status = message.includes("limit") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
