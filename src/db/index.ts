import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { ensureTrendsSchema } from "./migrate";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "wordstat.db");

function ensureDbFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

ensureDbFile();

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
ensureTrendsSchema(sqlite);

export const db = drizzle(sqlite, { schema });
export { sqlite };
