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
      userId,
    });

    recordUsage(userId, "research");
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sphere analysis failed";
    const status = message.includes("limit")
      ? 429
      : message.includes("login")
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
