import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminAuditLog, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { applyProToUser, revokePro } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const rows = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        status: users.status,
        locale: users.locale,
        createdAt: users.createdAt,
      })
      .from(users)
      .all();
    return NextResponse.json({ users: rows });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  userId: z.string(),
  action: z.enum(["make_admin", "make_user", "force_pro", "force_free", "disable", "enable"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const { user: actor } = await requireAdmin();
    const body = patchSchema.parse(await req.json());
    const target = db.select().from(users).where(eq(users.id, body.userId)).get();
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const now = new Date().toISOString();
    switch (body.action) {
      case "make_admin":
        db.update(users).set({ role: "admin", updatedAt: now }).where(eq(users.id, target.id)).run();
        break;
      case "make_user":
        db.update(users).set({ role: "user", updatedAt: now }).where(eq(users.id, target.id)).run();
        break;
      case "force_pro":
        applyProToUser(target.id, { status: "active" });
        break;
      case "force_free":
        revokePro(target.id);
        break;
      case "disable":
        db.update(users).set({ status: "disabled", updatedAt: now }).where(eq(users.id, target.id)).run();
        break;
      case "enable":
        db.update(users).set({ status: "active", updatedAt: now }).where(eq(users.id, target.id)).run();
        break;
    }

    db.insert(adminAuditLog)
      .values({
        actorId: actor.id,
        action: body.action,
        payload: JSON.stringify({ userId: body.userId }),
        createdAt: now,
      })
      .run();

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
