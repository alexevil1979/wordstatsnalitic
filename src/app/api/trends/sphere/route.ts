import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/users";
import { assertWithinLimit, recordUsage } from "@/lib/billing/usage";
import { getSphere } from "@/data/spheres";
import { analyzeSphere } from "@/lib/trends/sphere-analysis";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  sphereId: z.string().min(1),
  country: z.string().length(2),
  timeframe: z
    .enum(["now 7-d", "today 3-m", "today 12-m", "today 5-y"])
    .optional(),
  force: z.boolean().optional(),
  queryLimit: z.number().int().min(1).max(4).optional(),
});

/**
 * Public Markets refresh: Google Trends for a sphere×country.
 * Login optional — guests get data; logged-in users count toward daily caps.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    let user = null as ReturnType<typeof getUserById>;
    if (userId) {
      user = getUserById(userId);
      if (user && user.status === "active") {
        assertWithinLimit(userId, "research");
      } else {
        user = null;
      }
    }

    const body = bodySchema.parse(await req.json());
    if (!getSphere(body.sphereId)) {
      return NextResponse.json({ error: "unknown_sphere" }, { status: 400 });
    }

    const data = await analyzeSphere({
      sphereId: body.sphereId,
      country: body.country,
      timeframe: body.timeframe,
      force: body.force ?? true,
      queryLimit: body.queryLimit ?? 3,
      delayMs: 3000,
      userId: user?.id ?? null,
    });

    if (user) {
      recordUsage(user.id, "research");
    }

    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sphere analysis failed";
    const status = message.includes("limit") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
