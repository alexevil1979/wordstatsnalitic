import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { GATEWAY_CATALOG, webhookPath } from "@/lib/billing/gateways/catalog";
import {
  ensureDefaultGateways,
  listGateways,
  maskGatewayForClient,
  updateGateway,
} from "@/lib/billing/gateways/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    ensureDefaultGateways();
    const base = process.env.APP_URL || "https://wordstat.1tlt.ru";
    return NextResponse.json({
      gateways: listGateways().map((g) => ({
        ...maskGatewayForClient(g, false),
        fields: GATEWAY_CATALOG.find((d) => d.code === g.code)?.fields || [],
        webhookUrl: `${base.replace(/\/$/, "")}${webhookPath(g.code)}`,
      })),
      catalog: GATEWAY_CATALOG.map((d) => ({ code: d.code, name: d.name, cnFriendly: d.cnFriendly })),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

const putSchema = z.object({
  code: z.string().min(1),
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  testMode: z.boolean().optional(),
  minAmountRub: z.number().optional(),
  config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = putSchema.parse(await req.json());
    const updated = updateGateway(body.code, {
      name: body.name,
      enabled: body.enabled,
      testMode: body.testMode,
      minAmountRub: body.minAmountRub,
      config: body.config as Record<string, string | number | boolean>,
    });
    return NextResponse.json({
      gateway: {
        ...maskGatewayForClient(updated, false),
        fields: GATEWAY_CATALOG.find((d) => d.code === updated.code)?.fields || [],
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof Error && e.message === "GATEWAY_NOT_FOUND") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
