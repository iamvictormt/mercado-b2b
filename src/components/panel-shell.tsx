"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Menu,
  Package,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { PanelActions } from "@/components/panel-actions";
import { PanelLocaleProvider } from "@/components/panel-locale";
import { useStoreLocale } from "@/components/storefront";
import { Button } from "@/components/ui/button";
import type { StoreLocale } from "@/lib/products";
import { cn } from "@/lib/utils";

type PanelVariant = "admin" | "account";

type NavigationItem = {
  href: string;
  label: Record<StoreLocale, string>;
  icon: LucideIcon;
};

const adminNavigation: NavigationItem[] = [
  { href: "/admin/summary", label: { pt: "Resumo", en: "Overview" }, icon: BarChart3 },
  { href: "/admin/products", label: { pt: "Produtos", en: "Products" }, icon: Package },
  { href: "/admin/quotes", label: { pt: "Cotações", en: "Quotes" }, icon: FileText },
  { href: "/admin/companies", label: { pt: "Empresas", en: "Companies" }, icon: Building2 },
  {
    href: "/admin/sourcing",
    label: { pt: "Pedidos de pesquisa", en: "Sourcing requests" },
    icon: Search,
  },
];

const accountNavigation: NavigationItem[] = [
  {
    href: "/account/quotes",
    label: { pt: "Minhas cotações", en: "My quotes" },
    icon: FileText,
  },
  {
    href: "/account/sourcing",
    label: { pt: "Pedidos de pesquisa", en: "Sourcing requests" },
    icon: Search,
  },
  {
    href: "/account/company",
    label: { pt: "Dados da empresa", en: "Company details" },
    icon: UserRound,
  },
  { href: "/account/favorites", label: { pt: "Favoritos", en: "Favourites" }, icon: Heart },
];

const panelCopy = {
  pt: {
    admin: "admin",
    customer: "cliente",
    adminPanel: "Painel administrativo",
    customerArea: "Área do cliente",
    account: "Conta",
    navigation: "Navegação do painel",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    panelMenu: "Menu do painel",
    expandMenu: "Expandir menu",
    collapseMenu: "Minimizar menu",
    language: "Idioma",
  },
  en: {
    admin: "admin",
    customer: "customer",
    adminPanel: "Administration panel",
    customerArea: "Customer area",
    account: "Account",
    navigation: "Panel navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    panelMenu: "Panel menu",
    expandMenu: "Expand menu",
    collapseMenu: "Collapse menu",
    language: "Language",
  },
};

function PanelLocaleSwitch({
  locale,
  onLocaleChange,
  compact = false,
}: {
  locale: StoreLocale;
  onLocaleChange: (locale: StoreLocale) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center border border-foreground/10 bg-background/55 p-1",
        compact ? "justify-center" : "justify-between",
      )}
      aria-label={panelCopy[locale].language}
    >
      {!compact && (
        <span className="pl-2 text-[9px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
          {panelCopy[locale].language}
        </span>
      )}
      <div className="flex items-center text-[9px] font-semibold uppercase tracking-wider">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onLocaleChange("pt")}
          aria-pressed={locale === "pt"}
          className={cn(
            "h-7 rounded-none px-2",
            locale === "pt" ? "bg-foreground text-background hover:bg-foreground/90" : "opacity-50",
          )}
        >
          PT
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onLocaleChange("en")}
          aria-pressed={locale === "en"}
          className={cn(
            "h-7 rounded-none px-2",
            locale === "en" ? "bg-foreground text-background hover:bg-foreground/90" : "opacity-50",
          )}
        >
          EN
        </Button>
      </div>
    </div>
  );
}

export function PanelShell({
  variant,
  contextLabel,
  sessionExpiresAt,
  children,
}: {
  variant: PanelVariant;
  contextLabel?: string;
  sessionExpiresAt: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, changeLocale } = useStoreLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigation = variant === "admin" ? adminNavigation : accountNavigation;
  const activeItem = navigation.find(({ href }) => pathname === href) ?? navigation[0];
  const t = panelCopy[locale];
  const panelName = variant === "admin" ? t.admin : t.customer;

  useEffect(() => {
    const remaining = new Date(sessionExpiresAt).getTime() - Date.now();
    const expireSession = () => {
      void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        router.replace("/auth?expired=1");
        router.refresh();
      });
    };

    if (remaining <= 0) {
      expireSession();
      return;
    }

    const timeout = window.setTimeout(expireSession, remaining);
    return () => window.clearTimeout(timeout);
  }, [router, sessionExpiresAt]);

  const nav = (mini = false) => (
    <nav className="mt-6 flex flex-col gap-2 lg:mt-12" aria-label={t.navigation}>
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const localizedLabel = label[locale];
        return (
          <Button
            key={href}
            asChild
            variant="ghost"
            title={mini ? localizedLabel : undefined}
            className={cn(
              "h-11 w-full shrink-0 gap-3 rounded px-3 text-sm",
              mini ? "justify-center" : "justify-start",
              active
                ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                : "hover:bg-background/70",
            )}
          >
            <Link
              href={href}
              aria-label={mini ? localizedLabel : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <Icon className="size-4" /> {!mini && localizedLabel}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <PanelLocaleProvider locale={locale}>
      <div
        className={cn(
          "min-h-screen bg-background text-foreground lg:grid",
          collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
      <div className="flex items-center justify-between border-b border-border bg-store-mint/60 px-5 py-4 lg:hidden">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {panelName}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <PanelLocaleSwitch locale={locale} onLocaleChange={changeLocale} compact />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label={t.openMenu}
          >
            <Menu className="size-6" />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.panelMenu}
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMenuOpen(false)}
            aria-label={t.closeMenu}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-store-mint shadow-xl">
            <div className="flex items-start justify-between p-5">
              <Link href="/" className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
                <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {panelName}
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                aria-label={t.closeMenu}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="px-5">{nav()}</div>
            <div className="mt-auto">
              <div className="px-5 pb-3">
                <PanelLocaleSwitch locale={locale} onLocaleChange={changeLocale} />
              </div>
              <PanelActions locale={locale} onNavigate={() => setMenuOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "hidden border-r border-border bg-store-mint/60 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col",
          collapsed ? "lg:w-[72px]" : "lg:w-[280px]",
        )}
      >
        <div className={collapsed ? "p-3" : "p-8"}>
          <div
            className={cn(
              "flex items-start",
              collapsed ? "flex-col items-center gap-5" : "justify-between gap-2",
            )}
          >
            <Link href="/" title="Mercado B2B" className="flex flex-col gap-1">
              <span className="font-display text-2xl italic leading-tight">
                {collapsed ? "M" : "Mercado B2B"}
              </span>
              {!collapsed && (
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {panelName}
                </span>
              )}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? t.expandMenu : t.collapseMenu}
              title={collapsed ? t.expandMenu : t.collapseMenu}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
          {nav(collapsed)}
        </div>
        <div className="mt-auto">
          <div className={collapsed ? "px-2 pb-2" : "px-8 pb-3"}>
            <PanelLocaleSwitch locale={locale} onLocaleChange={changeLocale} compact={collapsed} />
          </div>
          <PanelActions locale={locale} compact={collapsed} />
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-8 lg:p-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {variant === "admin"
              ? t.adminPanel
              : `${t.customerArea} · ${contextLabel ?? t.account}`}
          </p>
          <h1 className="font-display text-5xl">{activeItem?.label[locale]}</h1>
        </header>
        {children}
      </main>
      </div>
    </PanelLocaleProvider>
  );
}
