"use client";

import Link from "next/link";
import { AlertCircle, Heart, LoaderCircle, RotateCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePanelLocale } from "@/components/panel-locale";
import { formatMoney } from "@/lib/products";

type FavoriteProduct = {
  id: string;
  namePt: string;
  nameEn: string;
  detailPt: string | null;
  detailEn: string | null;
  price: string | number;
  currency: string;
  originPt: string;
  originEn: string;
  imageUrl: string | null;
  favoritedAt: string;
};

const copy = {
  pt: {
    loadError: "Não foi possível carregar os favoritos.",
    removeError: "Não foi possível remover o favorito.",
    removed: "removido dos favoritos.",
    retry: "Tentar novamente",
    emptyTitle: "Ainda não guardou nenhum produto.",
    emptyText: "Explore o catálogo e guarde os equipamentos que pretende rever mais tarde.",
    explore: "Explorar catálogo",
    saved: "produto guardado",
    savedPlural: "produtos guardados",
    refresh: "Atualizar",
    remove: "Remover dos favoritos",
    origin: "Origem",
  },
  en: {
    loadError: "Favourites could not be loaded.",
    removeError: "The favourite could not be removed.",
    removed: "removed from favourites.",
    retry: "Try again",
    emptyTitle: "You have not saved any products yet.",
    emptyText: "Browse the catalogue and save equipment you want to revisit later.",
    explore: "Browse catalogue",
    saved: "saved product",
    savedPlural: "saved products",
    refresh: "Refresh",
    remove: "Remove from favourites",
    origin: "Origin",
  },
};

export function CustomerFavoriteList() {
  const locale = usePanelLocale();
  const t = copy[locale];
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      const body = (await response.json()) as { items?: FavoriteProduct[]; error?: string };
      if (!response.ok || !body.items) {
        throw new Error(body.error ?? t.loadError);
      }
      setFavorites(body.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const removeFavorite = async (product: FavoriteProduct) => {
    setRemovingId(product.id);
    try {
      const response = await fetch(`/api/favorites/${product.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? t.removeError);
      }
      setFavorites((current) => current.filter((item) => item.id !== product.id));
      toast.success(`${locale === "pt" ? product.namePt : product.nameEn} ${t.removed}`);
    } catch (removeError) {
      toast.error(
        removeError instanceof Error ? removeError.message : t.removeError,
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card p-8 text-center">
        <div>
          <AlertCircle className="mx-auto size-6 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button
            variant="outline"
            className="mt-5 rounded-none"
            onClick={() => void loadFavorites()}
          >
            <RotateCw /> {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="grid min-h-72 place-items-center border border-border bg-card p-8 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-store-coral/15">
            <Heart className="size-5" />
          </span>
          <h2 className="mt-5 font-display text-3xl italic">{t.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.emptyText}</p>
          <Button asChild className="mt-6 rounded-none">
            <Link href="/catalog">{t.explore}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? t.saved : t.savedPlural}
        </p>
        <Button variant="ghost" size="sm" onClick={() => void loadFavorites()}>
          <RotateCw className="size-3.5" /> {t.refresh}
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((product) => (
          <article key={product.id} className="group border border-border bg-card p-4">
            <Link
              href={`/product/${product.id}`}
              className="relative block aspect-[4/3] overflow-hidden bg-store-mint"
            >
              <img
                src={product.imageUrl ?? "/product-placeholder.svg"}
                alt={locale === "pt" ? product.namePt : product.nameEn}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </Link>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/product/${product.id}`} className="font-medium hover:opacity-60">
                  {locale === "pt" ? product.namePt : product.nameEn}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {(locale === "pt" ? product.detailPt : product.detailEn) ||
                    (locale === "pt" ? product.originPt : product.originEn)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={removingId === product.id}
                onClick={() => void removeFavorite(product)}
                aria-label={`${t.remove}: ${locale === "pt" ? product.namePt : product.nameEn}`}
                className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                {removingId === product.id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
              </Button>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                {t.origin}: {locale === "pt" ? product.originPt : product.originEn}
              </span>
              <strong className="font-display text-xl italic">
                {formatMoney(Number(product.price), locale, product.currency)}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
