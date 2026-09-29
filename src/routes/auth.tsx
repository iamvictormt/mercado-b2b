"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
type Locale = "pt" | "en";

const copy = {
  pt: {
    login: "Entrar",
    signup: "Criar conta",
    loginTitle: "Bem-vindo de volta.",
    signupTitle: "A sua conta Mercado B2B.",
    loginSubtitle: "Entre para acompanhar cotações, pedidos de pesquisa e dados da empresa.",
    signupSubtitle: "Crie o seu acesso para gerir compras empresariais com mais rapidez.",
    name: "Nome completo",
    email: "E-mail",
    password: "Palavra-passe",
    forgot: "Esqueci-me da palavra-passe",
    actionLogin: "Entrar na conta",
    actionSignup: "Criar a minha conta",
    soon: "Acesso seguro",
    sending: "A processar...",
    back: "Voltar à plataforma",
    showPassword: "Mostrar palavra-passe",
    hidePassword: "Ocultar palavra-passe",
  },
  en: {
    login: "Sign in",
    signup: "Create account",
    loginTitle: "Welcome back.",
    signupTitle: "Your Mercado B2B account.",
    loginSubtitle: "Sign in to follow quotes, sourcing requests and company details.",
    signupSubtitle: "Create access to manage business procurement faster.",
    name: "Full name",
    email: "Email",
    password: "Password",
    forgot: "Forgot my password",
    actionLogin: "Sign in",
    actionSignup: "Create my account",
    soon: "Secure access",
    sending: "Processing...",
    back: "Back to platform",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [locale, setLocale] = useState<Locale>("pt");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = copy[locale];
  const isSignup = mode === "signup";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isSignup ? { name: String(formData.get("name") ?? "") } : {}),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch(`/api/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        user?: { role: "CUSTOMER" | "ADMIN" };
      };

      if (!response.ok || !result.user) {
        toast.error(result.error ?? "Não foi possível concluir o acesso.");
        return;
      }

      toast.success(isSignup ? "Conta criada com sucesso." : "Sessão iniciada.");
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const safeNext =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
      router.replace(
        safeNext ?? (result.user.role === "ADMIN" ? "/admin/summary" : "/account/quotes"),
      );
      router.refresh();
    } catch {
      toast.error("Não foi possível comunicar com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[.82fr_1.18fr]">
      <section className="relative hidden overflow-hidden bg-store-mint p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative z-10 flex items-baseline gap-2" aria-label="Mercado B2B">
          <span className="font-display text-3xl italic">Mercado</span>
          <span className="text-sm font-semibold tracking-widest">B2B</span>
          <span className="size-1.5 rounded-full bg-primary" />
        </Link>
        <div className="absolute left-1/2 top-1/2 size-[55vw] max-h-[780px] max-w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10" />
        <div className="relative z-10 max-w-lg">
          <p className="font-display text-6xl italic leading-none">Compras empresariais simples.</p>
          <p className="mt-7 max-w-sm text-sm leading-7 text-muted-foreground">
            Um espaço visual para empresas acompanharem cotações, pedidos e favoritos.
          </p>
        </div>
        <p className="relative z-10 text-[10px] font-medium uppercase tracking-widest">
          Mercado B2B / 2026
        </p>
      </section>

      <section className="flex min-h-screen flex-col bg-card px-5 sm:px-10 lg:px-20">
        <header className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
          >
            <ArrowLeft className="size-4" /> {t.back}
          </Link>
          <div className="flex items-center text-[10px] font-medium uppercase">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale("pt")}
              className={cn("h-8 px-2", locale !== "pt" && "text-muted-foreground")}
            >
              PT
            </Button>
            <span className="text-border">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale("en")}
              className={cn("h-8 px-2", locale !== "en" && "text-muted-foreground")}
            >
              EN
            </Button>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-10 flex border-b border-border" role="tablist">
            {(["login", "signup"] as Mode[]).map((item) => (
              <Button
                key={item}
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode(item);
                  setShowPassword(false);
                }}
                className={cn(
                  "h-12 flex-1 rounded-none border-b-2 border-transparent text-[10px] uppercase tracking-widest hover:bg-transparent",
                  mode === item && "border-foreground",
                )}
              >
                {item === "login" ? t.login : t.signup}
              </Button>
            ))}
          </div>

          <p className="mb-5 inline-flex w-fit items-center gap-2 bg-store-mint px-3 py-1 text-[9px] font-semibold uppercase tracking-widest">
            <LockKeyhole className="size-3" />
            {t.soon}
          </p>
          <h1 className="font-display text-5xl italic sm:text-6xl">
            {isSignup ? t.signupTitle : t.loginTitle}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {isSignup ? t.signupSubtitle : t.loginSubtitle}
          </p>

          <form onSubmit={submit} className="mt-10 space-y-5">
            {isSignup && (
              <Input
                label={t.name}
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={160}
                autoComplete="name"
                placeholder={t.name}
                prefix={<UserRound className="size-4" />}
                controlClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              />
            )}
            <Input
              label={t.email}
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              placeholder="nome@empresa.pt"
              prefix={<Mail className="size-4" />}
              controlClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <Input
              label={t.password}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={isSignup ? 8 : 1}
              maxLength={128}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              prefix={<LockKeyhole className="size-4" />}
              suffix={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="size-8"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              }
              controlClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            {!isSignup && (
              <Button
                type="button"
                variant="link"
                onClick={() => toast.info("A recuperação de palavra-passe será criada a seguir.")}
                className="h-auto p-0 text-xs text-muted-foreground underline-offset-4"
              >
                {t.forgot}
              </Button>
            )}
            <Button type="submit" disabled={submitting} className="mt-4 h-12 w-full rounded-none">
              {submitting ? t.sending : isSignup ? t.actionSignup : t.actionLogin}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
