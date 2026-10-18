import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/auth/users";
import { signIn } from "@/auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().max(120).optional(),
  locale: z.string().max(8).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    await createUser(body);
    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "EXISTS") {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    if (msg === "WEAK_PASSWORD") {
      return NextResponse.json({ error: "weak" }, { status: 400 });
    }
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
