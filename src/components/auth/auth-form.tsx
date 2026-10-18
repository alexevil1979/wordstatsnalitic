"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, locale }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(
            json.error === "exists"
              ? t("exists")
              : json.error === "weak"
                ? t("weakPassword")
                : t("error")
          );
          return;
        }
        const login = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (login?.error) {
          setError(t("invalid"));
          return;
        }
        router.push("/cabinet");
        router.refresh();
        return;
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(t("invalid"));
        return;
      }
      router.push("/cabinet");
      router.refresh();
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md surface p-6 shadow-sm">
      <h1 className="font-display text-2xl text-slate-900">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === "register" ? (
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "login" ? t("submitLogin") : t("submitRegister")}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={mode === "login" ? "/auth/register" : "/auth/login"}
          className="font-medium text-teal-800 underline-offset-2 hover:underline"
        >
          {mode === "login" ? t("toRegister") : t("toLogin")}
        </Link>
      </p>
    </div>
  );
}
