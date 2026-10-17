import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const seedDir = path.join(root, "data", "seed");
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "wordstat.db");

execSync("npx tsx scripts/generate-opportunities.ts", { stdio: "inherit", cwd: root });

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  const p = dbPath + suffix;
  if (!fs.existsSync(p)) continue;
  try {
    fs.unlinkSync(p);
  } catch {
    // If Next.js holds the file, fall through and recreate via overwrite open
  }
}


const countries = JSON.parse(fs.readFileSync(path.join(seedDir, "countries.json"), "utf8"));
const niches = JSON.parse(fs.readFileSync(path.join(seedDir, "niches.json"), "utf8"));
const opportunities = JSON.parse(
  fs.readFileSync(path.join(seedDir, "opportunities.json"), "utf8")
);
const insights = JSON.parse(fs.readFileSync(path.join(seedDir, "insights.json"), "utf8"));

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE countries (
    code TEXT PRIMARY KEY,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    region TEXT NOT NULL,
    currency TEXT NOT NULL
  );
  CREATE TABLE niches (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL
  );
  CREATE TABLE opportunities (
    id TEXT PRIMARY KEY,
    country_code TEXT NOT NULL REFERENCES countries(code),
    niche_id TEXT NOT NULL REFERENCES niches(id),
    query_cluster TEXT NOT NULL,
    search_volume INTEGER NOT NULL,
    trend TEXT NOT NULL,
    competition TEXT NOT NULL,
    commercial_intent TEXT NOT NULL,
    margin_potential TEXT NOT NULL,
    entry_difficulty TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    example_offer TEXT NOT NULL,
    example_offer_ru TEXT NOT NULL,
    price_range TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'expert_estimate',
    confidence REAL NOT NULL DEFAULT 0.7,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE insights (
    id TEXT PRIMARY KEY,
    rank INTEGER NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    body_ru TEXT NOT NULL,
    body_en TEXT NOT NULL,
    niche_ids TEXT NOT NULL,
    country_codes TEXT NOT NULL
  );
  CREATE INDEX idx_opp_country ON opportunities(country_code);
  CREATE INDEX idx_opp_niche ON opportunities(niche_id);
  CREATE INDEX idx_opp_competition ON opportunities(competition);
  CREATE INDEX idx_opp_margin ON opportunities(margin_potential);
`);

const insertCountry = sqlite.prepare(
  `INSERT INTO countries (code, name_ru, name_en, region, currency) VALUES (@code, @nameRu, @nameEn, @region, @currency)`
);
const insertNiche = sqlite.prepare(
  `INSERT INTO niches (id, category, name_ru, name_en) VALUES (@id, @category, @nameRu, @nameEn)`
);
const insertOpp = sqlite.prepare(`
  INSERT INTO opportunities (
    id, country_code, niche_id, query_cluster, search_volume, trend, competition,
    commercial_intent, margin_potential, entry_difficulty, recommendation,
    example_offer, example_offer_ru, price_range, source, confidence, updated_at
  ) VALUES (
    @id, @countryCode, @nicheId, @queryCluster, @searchVolume, @trend, @competition,
    @commercialIntent, @marginPotential, @entryDifficulty, @recommendation,
    @exampleOffer, @exampleOfferRu, @priceRange, @source, @confidence, @updatedAt
  )
`);
const insertInsight = sqlite.prepare(`
  INSERT INTO insights (id, rank, title_ru, title_en, body_ru, body_en, niche_ids, country_codes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const tx = sqlite.transaction(() => {
  for (const c of countries) insertCountry.run(c);
  for (const n of niches) insertNiche.run(n);
  for (const o of opportunities) insertOpp.run(o);
  for (const i of insights) {
    insertInsight.run(
      i.id,
      i.rank,
      i.titleRu,
      i.titleEn,
      i.bodyRu,
      i.bodyEn,
      JSON.stringify(i.nicheIds),
      JSON.stringify(i.countryCodes)
    );
  }
});

tx();
sqlite.close();

console.log(
  `Seeded DB: ${countries.length} countries, ${niches.length} niches, ${opportunities.length} opportunities, ${insights.length} insights`
);
