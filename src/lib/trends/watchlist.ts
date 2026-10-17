import fs from "node:fs";
import path from "node:path";

export type WatchItem = { nicheId: string; query: string };

export function loadWatchlist(): WatchItem[] {
  const p = path.join(process.cwd(), "data", "seed", "watchlist.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as WatchItem[];
}

export function queriesForNiche(nicheId: string, limit = 5): string[] {
  const items = loadWatchlist().filter((i) => i.nicheId === nicheId);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const q = i.query.trim();
    if (!q || seen.has(q.toLowerCase())) continue;
    seen.add(q.toLowerCase());
    out.push(q);
    if (out.length >= limit) break;
  }
  return out;
}
