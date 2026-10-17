/**
 * Batch refresh: for each niche × priority country, pull Trends seed queries → upsert catalog.
 * Usage: npm run trends:refresh
 */
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, sqlite } from "../src/db";
import { catalogRefreshJobs } from "../src/db/schema";
import { analyzeNiche } from "../src/lib/trends/niche-analysis";
import { loadWatchlist } from "../src/lib/trends/watchlist";
import { getSetting } from "../src/lib/settings";

const PRIORITY_COUNTRIES = ["US", "GB", "DE", "AE", "RU", "AU", "CA"];

async function main() {
  const niches = [...new Set(loadWatchlist().map((i) => i.nicheId))];
  const jobs = niches.flatMap((nicheId) =>
    PRIORITY_COUNTRIES.map((country) => ({ nicheId, country }))
  );

  const jobId = nanoid(10);
  const startedAt = new Date().toISOString();
  const provider = getSetting("KEYWORD_PROVIDER", "google_trends");

  db.insert(catalogRefreshJobs)
    .values({
      id: jobId,
      status: "running",
      provider,
      total: jobs.length,
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

  for (const job of jobs) {
    try {
      console.log(`[trends] niche=${job.nicheId} country=${job.country}`);
      await analyzeNiche({
        nicheId: job.nicheId,
        country: job.country,
        timeframe: "today 12-m",
        force: true,
        upsertCatalog: true,
        queryLimit: 3,
        delayMs: 4000,
      });
      done += 1;
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${job.nicheId}/${job.country}: ${msg}`);
      console.error(`[trends] FAIL`, msg);
    }
    db.update(catalogRefreshJobs)
      .set({ done, failed })
      .where(eq(catalogRefreshJobs.id, jobId))
      .run();
  }

  db.update(catalogRefreshJobs)
    .set({
      status: failed === jobs.length ? "failed" : "ok",
      done,
      failed,
      message: errors.slice(0, 5).join(" | ") || null,
      finishedAt: new Date().toISOString(),
    })
    .where(eq(catalogRefreshJobs.id, jobId))
    .run();

  console.log(`Done job ${jobId}: ${done} ok, ${failed} failed / ${jobs.length}`);
  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
