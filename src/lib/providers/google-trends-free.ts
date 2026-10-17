import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getSetting } from "@/lib/settings";
import type {
  KeywordProvider,
  PartialOpportunity,
  TrendResearchResult,
} from "./types";

function resolvePython(): string {
  const configured = getSetting("TRENDS_PYTHON", "");
  if (configured) return configured;
  const venvUnix = path.join(process.cwd(), ".venv", "bin", "python");
  const venvWin = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
  if (fs.existsSync(venvUnix)) return venvUnix;
  if (fs.existsSync(venvWin)) return venvWin;
  return process.platform === "win32" ? "py" : "python3";
}

function runTrendsClient(payload: Record<string, unknown>): Promise<TrendResearchResult> {
  const script = path.join(process.cwd(), "scripts", "trends_client.py");
  const python = resolvePython();
  const args = process.platform === "win32" && python === "py" ? ["-3", script] : [script];

  return new Promise((resolve, reject) => {
    const child = spawn(python, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      try {
        const parsed = JSON.parse(stdout.trim() || "{}") as TrendResearchResult & {
          ok?: boolean;
          error?: string;
        };
        if (!parsed.ok && parsed.error) {
          reject(new Error(parsed.error + (stderr ? ` | ${stderr.slice(0, 200)}` : "")));
          return;
        }
        if (code !== 0 && !parsed.points) {
          reject(new Error(parsed.error || stderr || `trends_client exited ${code}`));
          return;
        }
        resolve({
          provider: "google_trends",
          query: parsed.query,
          country: parsed.country,
          geo: parsed.geo,
          timeframe: parsed.timeframe,
          points: parsed.points ?? [],
          relatedTop: parsed.relatedTop ?? [],
          relatedRising: parsed.relatedRising ?? [],
          regions: parsed.regions ?? [],
        });
      } catch (e) {
        reject(
          new Error(
            `Failed to parse trends_client output: ${e instanceof Error ? e.message : String(e)}. stderr=${stderr.slice(0, 300)} stdout=${stdout.slice(0, 300)}`
          )
        );
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export class GoogleTrendsFreeProvider implements KeywordProvider {
  readonly name = "google_trends";

  async research(params: {
    query: string;
    country: string;
    timeframe?: string;
  }): Promise<TrendResearchResult> {
    return runTrendsClient({
      action: "research",
      query: params.query,
      country: params.country,
      timeframe: params.timeframe ?? "today 12-m",
    });
  }

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    const result = await this.research({
      query: params.query,
      country: params.country,
      timeframe: "today 12-m",
    });
    const avg =
      result.points.length === 0
        ? 0
        : result.points.reduce((s, p) => s + p.interest, 0) / result.points.length;
    return [
      {
        queryCluster: params.query,
        countryCode: params.country,
        searchVolume: Math.round(avg * 100),
        source: "google_trends",
        confidence: 0.55,
      },
    ];
  }
}
