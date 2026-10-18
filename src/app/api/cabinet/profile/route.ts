import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { isAppLocale } from "@/i18n/routing";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().max(120).optional(),
  locale: z.string().max(8).optional(),
  password: z.string().min(8).max(200).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const body = schema.parse(await req.json());
    const patch: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.locale && isAppLocale(body.locale)) patch.locale = body.locale;
    if (body.password) patch.passwordHash = await bcrypt.hash(body.password, 10);

    db.update(users).set(patch).where(eq(users.id, user.id)).run();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
