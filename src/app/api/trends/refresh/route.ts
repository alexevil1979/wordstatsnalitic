import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";

export const runtime = "nodejs";

/** Fire-and-forget full catalog Trends refresh (all niches × major countries). */
export async function POST() {
  const script = path.join(process.cwd(), "scripts", "trends-refresh.ts");
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsx", script],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      env: process.env,
    }
  );
  child.unref();

  return NextResponse.json({
    data: {
      started: true,
      message:
        "Full refresh started in background (all niches × major countries). Takes a while due to Google Trends rate limits.",
    },
  });
}
