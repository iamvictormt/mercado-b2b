"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Globe2,
  Heart,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Package,
  Search,
  UserRound,
  X,
} from "lucide-react";
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
    signIn: "Entrar",
    account: "Minha conta",
    admin: "Painel administrativo",
    myQuotes: "Minhas cotações",
    myRequests: "Meus pedidos de pesquisa",
    company: "Dados da empresa",
    favorites: "Meus favoritos",
    saveFavorite: "Guardar nos favoritos",
    savedFavorite: "Guardado nos favoritos",
    favoriteAdded: "Produto guardado nos favoritos.",
    favoriteRemoved: "Produto removido dos favoritos.",
    favoriteLogin: "Inicie sessão para guardar produtos.",
    products: "Gerir produtos",
    adminQuotes: "Gerir cotações",
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
    signIn: "Sign in",
    account: "My account",
    admin: "Admin dashboard",
    myQuotes: "My quotes",
    myRequests: "My sourcing requests",
    company: "Company details",
    favorites: "My favourites",
    saveFavorite: "Save to favourites",
    savedFavorite: "Saved to favourites",
    favoriteAdded: "Product saved to favourites.",
    favoriteRemoved: "Product removed from favourites.",
    favoriteLogin: "Sign in to save products.",
    products: "Manage products",
    adminQuotes: "Manage quotes",
    footer: "Business procurement platform · São Tomé and Príncipe",
  },
};

export type StorefrontViewer = {
  name: string;
  role: "CUSTOMER" | "ADMIN";
  companyName: string | null;
  sessionExpiresAt: string;
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
  viewer,
}: {
  locale: StoreLocale;
  onLocaleChange: (locale: StoreLocale) => void;
  viewer: StorefrontViewer | null;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = storeCopy[locale];
  const panelHref = viewer?.role === "ADMIN" ? "/admin/summary" : "/account/quotes";
  const panelLabel = viewer?.role === "ADMIN" ? t.admin : t.account;
  const contextualLinks =
    viewer?.role === "ADMIN"
      ? [
          { href: "/admin/summary", label: t.admin },
          { href: "/admin/products", label: t.products },
          { href: "/admin/quotes", label: t.adminQuotes },
        ]
      : viewer
        ? [
            { href: "/account/quotes", label: t.myQuotes },
            { href: "/account/sourcing", label: t.myRequests },
            { href: "/account/company", label: t.company },
            { href: "/account/favorites", label: t.favorites },
          ]
        : [];

  useEffect(() => {
    if (!viewer) return;
    const remaining = new Date(viewer.sessionExpiresAt).getTime() - Date.now();
    const refreshSession = () => router.refresh();
    if (remaining <= 0) {
      refreshSession();
      return;
    }
    const timeout = window.setTimeout(refreshSession, remaining);
    return () => window.clearTimeout(timeout);
  }, [router, viewer]);
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
          {viewer && (
            <Link href={panelHref} className="hover:opacity-50">
              {viewer.role === "ADMIN" ? t.admin : t.myQuotes}
            </Link>
          )}
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
          {viewer ? (
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-none border-foreground/15 bg-card px-2 hover:bg-store-mint/60 lg:px-3"
            >
              <Link href={panelHref} aria-label={panelLabel}>
                <span className="grid size-6 place-items-center rounded-full bg-foreground text-[10px] font-semibold uppercase text-background">
                  {viewer.name.charAt(0)}
                </span>
                <span className="hidden max-w-28 truncate text-[10px] font-semibold uppercase tracking-wider lg:block">
                  {viewer.name.split(" ")[0]}
                </span>
                <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-10 gap-2 px-2 lg:px-3">
              <Link href="/auth">
                <UserRound className="size-4" />
                <span className="hidden text-[10px] font-semibold uppercase tracking-widest lg:inline">
                  {t.signIn}
                </span>
              </Link>
            </Button>
          )}
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
          {contextualLinks.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 flex items-center gap-2 px-4 py-2 text-[9px] text-muted-foreground">
                <LayoutDashboard className="size-3.5" />
                {viewer?.name}
              </p>
              {contextualLinks.map((item) => (
                <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
                  <Link href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

export function StoreFooter({ locale }: { locale: StoreLocale }) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-16">
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

export function useProductFavorites(viewer: StorefrontViewer | null, locale: StoreLocale) {
  const router = useRouter();
  const pathname = usePathname();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(viewer?.role === "CUSTOMER");
  const t = storeCopy[locale];
  const isCustomer = viewer?.role === "CUSTOMER";

  useEffect(() => {
    if (!isCustomer) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetch("/api/favorites", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os favoritos.");
        const body = (await response.json()) as { items: Array<{ id: string }> };
        setFavoriteIds(new Set(body.items.map((item) => item.id)));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(
          error instanceof Error ? error.message : "Não foi possível carregar os favoritos.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isCustomer]);

  const toggleFavorite = async (productId: string) => {
    if (!viewer) {
      toast.info(t.favoriteLogin);
      router.push(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (viewer.role !== "CUSTOMER" || pendingIds.has(productId)) return;

    const wasFavorite = favoriteIds.has(productId);
    setPendingIds((current) => new Set(current).add(productId));
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (wasFavorite) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      const response = await fetch(
        wasFavorite ? `/api/favorites/${productId}` : "/api/favorites",
        wasFavorite
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ productId }),
            },
      );
      if (response.status === 401) {
        router.push(`/auth?next=${encodeURIComponent(pathname)}`);
        throw new Error(t.favoriteLogin);
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Não foi possível atualizar os favoritos.");
      }
      toast.success(wasFavorite ? t.favoriteRemoved : t.favoriteAdded);
    } catch (error) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.add(productId);
        else next.delete(productId);
        return next;
      });
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar os favoritos.",
      );
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(productId);
        return next;
      });
    }
  };

  return { favoriteIds, pendingIds, loading, toggleFavorite };
}

export function FavoriteButton({
  productId,
  locale,
  favorite,
  pending,
  loading = false,
  appearance = "overlay",
  onToggle,
}: {
  productId: string;
  locale: StoreLocale;
  favorite: boolean;
  pending: boolean;
  loading?: boolean;
  appearance?: "overlay" | "inline";
  onToggle: (productId: string) => Promise<void>;
}) {
  const t = storeCopy[locale];
  const label = favorite ? t.savedFavorite : t.saveFavorite;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={favorite}
      aria-busy={pending || loading}
      title={label}
      disabled={pending || loading}
      onClick={() => void onToggle(productId)}
      className={cn(
        "group/favorite inline-flex items-center justify-center border transition-all duration-300 disabled:cursor-wait disabled:opacity-65",
        appearance === "overlay"
          ? "size-11 rounded-full border-foreground/15 bg-background/90 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
          : "h-11 gap-2.5 rounded-none border-border bg-background px-4 text-[10px] font-semibold uppercase tracking-widest hover:border-foreground",
        favorite && "border-foreground bg-foreground text-background",
      )}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "size-4 transition-transform duration-300 group-hover/favorite:scale-110",
            favorite && "fill-current",
          )}
        />
      )}
      {appearance === "inline" && <span>{favorite ? t.savedFavorite : t.saveFavorite}</span>}
    </button>
  );
}

export function ProductGrid({
  items,
  locale,
  viewer,
}: {
  items: Product[];
  locale: StoreLocale;
  viewer: StorefrontViewer | null;
}) {
  const t = storeCopy[locale];
  const favorites = useProductFavorites(viewer, locale);
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <article key={p.id} className="group flex flex-col">
          <div className="relative">
            <Link
              href={`/product/${p.id}`}
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
            {viewer?.role !== "ADMIN" && (
              <div className="absolute right-4 top-4 z-10">
                <FavoriteButton
                  productId={String(p.id)}
                  locale={locale}
                  favorite={favorites.favoriteIds.has(String(p.id))}
                  pending={favorites.pendingIds.has(String(p.id))}
                  loading={favorites.loading}
                  onToggle={favorites.toggleFavorite}
                />
              </div>
            )}
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/product/${p.id}`} className="text-sm font-medium hover:opacity-50">
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
            asChild
            variant="outline"
            className="mt-4 h-11 rounded-none text-[10px] uppercase tracking-widest"
          >
            <Link href={`/product/${p.id}`}>
              {t.quote}
              <ArrowRight />
            </Link>
          </Button>
        </article>
      ))}
    </div>
  );
}
