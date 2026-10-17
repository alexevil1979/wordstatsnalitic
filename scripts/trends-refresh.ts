/**
 * Batch refresh watchlist via Google Trends → upsert opportunities.
 * Usage: npm run trends:refresh
 */
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, sqlite } from "../src/db";
import { catalogRefreshJobs } from "../src/db/schema";
import { researchTrends } from "../src/lib/trends/orchestrator";
import { upsertOpportunityFromTrends } from "../src/lib/trends/map-to-opportunity";
import { getSetting } from "../src/lib/settings";

type WatchItem = { query: string; country: string; nicheId: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const watchPath = path.join(process.cwd(), "data", "seed", "watchlist.json");
  const items = JSON.parse(fs.readFileSync(watchPath, "utf8")) as WatchItem[];
  const jobId = nanoid(10);
  const startedAt = new Date().toISOString();
  const provider = getSetting("KEYWORD_PROVIDER", "google_trends");

  db.insert(catalogRefreshJobs)
    .values({
      id: jobId,
      status: "running",
      provider,
      total: items.length,
      done: 0,
      failed: 0,
      message: null,
      startedAt,
      finishedAt: null,
    })
    .run();

  let done = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      console.log(`[trends] ${item.country} · ${item.query}`);
      const research = await researchTrends({
        query: item.query,
        country: item.country,
        timeframe: "today 12-m",
        force: true,
      });
      upsertOpportunityFromTrends({
        research,
        nicheId: item.nicheId,
      });
      done += 1;
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${item.country}/${item.query}: ${msg}`);
      console.error(`[trends] FAIL ${item.query}:`, msg);
    }
    db.update(catalogRefreshJobs)
      .set({ done, failed })
      .where(eq(catalogRefreshJobs.id, jobId))
      .run();
    await sleep(4000 + Math.floor(Math.random() * 4000));
  }

  const finishedAt = new Date().toISOString();
  db.update(catalogRefreshJobs)
    .set({
      status: failed === items.length ? "failed" : "ok",
      done,
      failed,
      message: errors.slice(0, 5).join(" | ") || null,
      finishedAt,
    })
    .where(eq(catalogRefreshJobs.id, jobId))
    .run();

  console.log(`Done job ${jobId}: ${done} ok, ${failed} failed / ${items.length}`);
  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
