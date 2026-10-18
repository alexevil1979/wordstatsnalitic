import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserById, verifyUser } from "@/lib/auth/users";
import { ensureDefaultPlans } from "@/lib/billing/plans";

ensureDefaultPlans();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      plan: string;
      locale: string;
    };
  }

  interface User {
    role: string;
    plan: string;
    locale: string;
  }
}

type AppToken = {
  id?: string;
  role?: string;
  plan?: string;
  locale?: string;
  email?: string | null;
  name?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/ru/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "");
        const password = String(credentials?.password || "");
        if (!email || !password) return null;
        const user = await verifyUser(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          locale: user.locale,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const t = token as typeof token & AppToken;
      if (user) {
        t.id = user.id!;
        t.role = (user as { role: string }).role;
        t.plan = (user as { plan: string }).plan;
        t.locale = (user as { locale: string }).locale;
      } else if (t.id && (trigger === "update" || !t.plan)) {
        const fresh = getUserById(String(t.id));
        if (fresh) {
          t.role = fresh.role;
          t.plan = fresh.plan;
          t.locale = fresh.locale;
          t.email = fresh.email;
          t.name = fresh.name;
        }
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as typeof token & AppToken;
      if (session.user) {
        session.user.id = String(t.id || "");
        session.user.role = String(t.role || "user");
        session.user.plan = String(t.plan || "free");
        session.user.locale = String(t.locale || "ru");
        session.user.email = String(t.email || session.user.email || "");
        session.user.name = (t.name as string | null | undefined) ?? session.user.name;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-wordstat-auth-secret-change-me",
});
