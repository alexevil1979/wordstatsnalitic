import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { ensureDefaultPlans } from "@/lib/billing/plans";
import type { AppLocale } from "@/i18n/routing";

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  locale?: string;
}) {
  ensureDefaultPlans();
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");
  if (input.password.length < 8) throw new Error("WEAK_PASSWORD");
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) throw new Error("EXISTS");

  const now = new Date().toISOString();
  const id = nanoid();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const isFirst = db.select().from(users).all().length === 0;
  const role = isFirst || email === (process.env.ADMIN_EMAIL || "").toLowerCase() ? "admin" : "user";

  db.insert(users)
    .values({
      id,
      email,
      passwordHash,
      name: input.name?.trim() || null,
      locale: (input.locale as AppLocale) || "ru",
      role,
      plan: "free",
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  db.insert(subscriptions)
    .values({
      id: nanoid(),
      userId: id,
      planId: "pro",
      status: "inactive",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return db.select().from(users).where(eq(users.id, id)).get()!;
}

export async function verifyUser(email: string, password: string) {
  const row = db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .get();
  if (!row || row.status !== "active") return null;
  const ok = await bcrypt.compare(password, row.passwordHash);
  return ok ? row : null;
}

export function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).get() ?? null;
}

export function getUserByEmail(email: string) {
  return (
    db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get() ?? null
  );
}
