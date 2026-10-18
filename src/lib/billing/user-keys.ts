import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { userApiKeys } from "@/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secrets";
import { getPlan } from "./plans";
import type { users } from "@/db/schema";

export const KEY_PROVIDERS = [
  "serpapi",
  "dataforseo_login",
  "dataforseo_password",
  "ahrefs",
] as const;

export type KeyProvider = (typeof KEY_PROVIDERS)[number];

export function listKeyHints(userId: string) {
  const rows = db.select().from(userApiKeys).where(eq(userApiKeys.userId, userId)).all();
  const out: Record<string, { configured: boolean; hint: string }> = {};
  for (const p of KEY_PROVIDERS) {
    const row = rows.find((r) => r.provider === p);
    out[p] = { configured: Boolean(row), hint: row?.hint || "" };
  }
  return out;
}

export function upsertUserKey(userId: string, provider: KeyProvider, value: string) {
  if (!value) return;
  const { ciphertext, iv, hint } = encryptSecret(value);
  const now = new Date().toISOString();
  const existing = db
    .select()
    .from(userApiKeys)
    .where(and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)))
    .get();
  if (existing) {
    db.update(userApiKeys)
      .set({ ciphertext, iv, hint, updatedAt: now })
      .where(eq(userApiKeys.id, existing.id))
      .run();
  } else {
    db.insert(userApiKeys)
      .values({
        id: nanoid(),
        userId,
        provider,
        ciphertext,
        iv,
        hint,
        updatedAt: now,
      })
      .run();
  }
}

export function getDecryptedUserKey(userId: string, provider: KeyProvider): string | null {
  const row = db
    .select()
    .from(userApiKeys)
    .where(and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)))
    .get();
  if (!row) return null;
  try {
    return decryptSecret(row.ciphertext, row.iv);
  } catch {
    return null;
  }
}

export function assertCanStorePaidKeys(user: typeof users.$inferSelect) {
  const plan = getPlan(user.plan);
  if (!plan.allowPaidKeys) {
    throw new Error("PRO_ONLY");
  }
}
