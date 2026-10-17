import { ExpertSeedProvider } from "./expert-seed";
import { GoogleTrendsFreeProvider } from "./google-trends-free";
import { SerpApiTrendsProvider } from "./serpapi";
import { AhrefsProvider, DataForSeoProvider } from "./stubs";
import { getSetting } from "@/lib/settings";
import type { KeywordProvider } from "./types";

export * from "./types";
export * from "./expert-seed";
export * from "./google-trends-free";
export * from "./serpapi";
export * from "./stubs";

const providers: Record<string, KeywordProvider> = {
  expert_seed: new ExpertSeedProvider(),
  google_trends: new GoogleTrendsFreeProvider(),
  serpapi: new SerpApiTrendsProvider(),
  dataforseo: new DataForSeoProvider(),
  ahrefs: new AhrefsProvider(),
};

export function getKeywordProvider(name?: string): KeywordProvider {
  const selected = name ?? getSetting("KEYWORD_PROVIDER", "google_trends");
  const provider = providers[selected];
  if (!provider) {
    throw new Error(`Unknown keyword provider: ${selected}`);
  }
  return provider;
}
