import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";

/** Fire-and-forget full catalog Trends refresh (admin only). */
export async function POST() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
