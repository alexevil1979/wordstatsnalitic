import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/users";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const user = getUserById(session.user.id);
  if (!user || user.status !== "active") {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { session, user };
}

export async function requireAdmin() {
  const ctx = await requireSession();
  if (ctx.user.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return ctx;
}
