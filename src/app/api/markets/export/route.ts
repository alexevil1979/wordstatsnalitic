import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/users";
import { assertWithinLimit, recordUsage } from "@/lib/billing/usage";
import { getMarketOverview } from "@/lib/trends/overview";
import { marketOverviewToXml } from "@/lib/markets-export";

export const runtime = "nodejs";

/** XML export of Markets overview — requires login; counts against daily XML cap. */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    const user = getUserById(userId);
    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    assertWithinLimit(userId, "xml_export");

    const locale = req.nextUrl.searchParams.get("locale") || user.locale || "ru";
    const overview = getMarketOverview();
    const xml = marketOverviewToXml(overview, locale);
    recordUsage(userId, "xml_export");

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="wordstat-markets-${stamp}.xml"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "export failed";
    const status = message.includes("limit") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
