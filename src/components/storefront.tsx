"use client";

import Link from "next/link";
import { ArrowRight, Clock, Globe2, Menu, Package, Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatMoney, type Product, type StoreLocale } from "@/lib/products";
import { cn } from "@/lib/utils";

export const storeCopy = {
  pt: {
    catalog: "Catálogo",
    find: "Encontra-me uma máquina",
    indicative: "Preço indicativo",
    origin: "Origem",
    lead: "Prazo estimado",
    min: "Qtd. mínima",
    quote: "Pedir cotação",
    quotePending: "As cotações serão ligadas ao novo banco na próxima etapa.",
    footer: "Plataforma de compras empresariais · São Tomé e Príncipe",
  },
  en: {
    catalog: "Catalogue",
    find: "Find me a machine",
    search: "Search equipment",
    indicative: "Indicative price",
    origin: "Origin",
    lead: "Estimated lead time",
    min: "Min. quantity",
    quote: "Request quote",
    quotePending: "Quotes will be connected to the new database in the next step.",
    footer: "Business procurement platform · São Tomé and Príncipe",
  },
};

export function useStoreLocale() {
  const [locale, setLocale] = useState<StoreLocale>("pt");
  useEffect(() => {
    const saved = window.localStorage.getItem("mercado-b2b-locale");
    if (saved === "pt" || saved === "en") setLocale(saved);
  }, []);
  const changeLocale = (next: StoreLocale) => {
    window.localStorage.setItem("mercado-b2b-locale", next);
    setLocale(next);
  };
  return { locale, changeLocale };
}

export function StoreHeader({
  locale,
  onLocaleChange,
}: {
  locale: StoreLocale;
  onLocaleChange: (locale: StoreLocale) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = storeCopy[locale];
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center px-5 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Mercado B2B">
          <span className="font-display text-2xl italic">Mercado</span>
          <span className="text-sm font-semibold tracking-widest">B2B</span>
          <span className="size-1 rounded-full bg-primary" />
        </Link>
        <nav className="ml-auto hidden items-center gap-10 text-[11px] font-medium uppercase tracking-widest md:flex">
          <Link href="/catalog" className="hover:opacity-50">
            {t.catalog}
          </Link>
          <Link href="/find-machine" className="hover:opacity-50">
            {t.find}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-10">
          <div className="flex items-center text-[10px] font-medium uppercase">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLocaleChange("pt")}
              className={cn("h-8 px-2", locale !== "pt" && "text-muted-foreground")}
            >
              PT
            </Button>
            <span className="text-border">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLocaleChange("en")}
              className={cn("h-8 px-2", locale !== "en" && "text-muted-foreground")}
            >
              EN
            </Button>
          </div>
          <Button asChild variant="ghost" size="icon">
            <Link
              href="/auth"
              aria-label={locale === "pt" ? "Entrar ou criar conta" : "Sign in or create account"}
            >
              <UserRound className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-4 text-xs font-medium uppercase tracking-widest md:hidden">
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/catalog" onClick={() => setMenuOpen(false)}>
              {t.catalog}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/find-machine" onClick={() => setMenuOpen(false)}>
              {t.find}
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function StoreFooter({ locale }: { locale: StoreLocale }) {
  return (
    <footer className="border-t border-border bg-card px-5 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-display text-2xl italic">
          Mercado{" "}
          <span className="font-sans text-sm font-semibold not-italic tracking-widest">B2B</span>{" "}
          <span className="text-primary">•</span>
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 · {storeCopy[locale].footer}
        </p>
      </div>
    </footer>
  );
}

export function ProductGrid({ items, locale }: { items: Product[]; locale: StoreLocale }) {
  const t = storeCopy[locale];
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <article key={p.id} className="group flex flex-col">
          <Link
            href={`/product/${p.slug}`}
            className="relative block aspect-[4/5] overflow-hidden bg-card"
          >
            <img
              src={p.image.src}
              alt={p.name[locale]}
              width={1024}
              height={1024}
              loading={i < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            />
            <span className="absolute left-4 top-4 bg-foreground px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-background">
              {p.categoryName[locale]}
            </span>
          </Link>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/product/${p.slug}`} className="text-sm font-medium hover:opacity-50">
                {p.name[locale]}
              </Link>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {p.detail[locale]}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                {t.indicative}
              </p>
              <p className="font-display text-xl italic">
                {formatMoney(p.price, locale, p.currency)}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-[10px]">
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Globe2 className="size-3" />
                {t.origin}
              </dt>
              <dd className="mt-1 font-medium">{p.origin[locale]}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" />
                {t.lead}
              </dt>
              <dd className="mt-1 font-medium">{p.leadTime[locale]}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Package className="size-3" />
                {t.min}
              </dt>
              <dd className="mt-1 font-medium">
                {p.minQty} {p.unit[locale]}
              </dd>
            </div>
          </dl>
          <Button
            onClick={() => toast.info(t.quotePending)}
            variant="outline"
            className="mt-4 h-11 rounded-none text-[10px] uppercase tracking-widest"
          >
            {t.quote}
            <ArrowRight />
          </Button>
        </article>
      ))}
    </div>
  );
}
