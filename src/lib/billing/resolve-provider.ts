import { getUserById } from "@/lib/auth/users";
import { getPlan } from "@/lib/billing/plans";
import { getDecryptedUserKey } from "@/lib/billing/user-keys";
import { getKeywordProvider } from "@/lib/providers";
import type { KeywordProvider } from "@/lib/providers/types";
import { SerpApiTrendsProvider } from "@/lib/providers/serpapi";

/**
 * BYOK model: Wordstat never spends platform paid API credits for users.
 * Free → google_trends only.
 * Pro → personal SerpAPI (or other user keys) when configured; else google_trends.
 */
export function resolveProviderForUser(userId?: string | null): {
  provider: KeywordProvider;
  providerName: string;
} {
  if (!userId) {
    const provider = getKeywordProvider("google_trends");
    return { provider, providerName: provider.name };
  }

  const user = getUserById(userId);
  if (!user) {
    const provider = getKeywordProvider("google_trends");
    return { provider, providerName: provider.name };
  }

  const plan = getPlan(user.plan);
  if (!plan.allowPaidKeys) {
    const provider = getKeywordProvider("google_trends");
    return { provider, providerName: provider.name };
  }

  const serpKey = getDecryptedUserKey(userId, "serpapi");
  if (serpKey) {
    const provider = new SerpApiTrendsProvider(serpKey);
    return { provider, providerName: provider.name };
  }

  // Pro without personal key: still free Trends (do not use platform paid keys).
  const provider = getKeywordProvider("google_trends");
  return { provider, providerName: provider.name };
}
