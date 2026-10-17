import { ExpertSeedProvider } from "./expert-seed";
import type { KeywordProvider } from "./types";

export * from "./types";
export * from "./expert-seed";
export * from "./stubs";

const providers: Record<string, KeywordProvider> = {
  expert_seed: new ExpertSeedProvider(),
};

export function getKeywordProvider(
  name = process.env.KEYWORD_PROVIDER ?? "expert_seed"
): KeywordProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown keyword provider: ${name}`);
  }
  return provider;
}
