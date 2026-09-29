"use client";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  ProductGrid,
  StoreFooter,
  StoreHeader,
  type StorefrontViewer,
  useStoreLocale,
} from "@/components/storefront";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

type Sort = "featured" | "low" | "high";
const copy = {
  pt: {
    overline: "CATÁLOGO",
    title: "Equipamentos e abastecimento",
    subtitle: "Encontre o equipamento certo para o seu negócio.",
    all: "Todos",
    sorts: { featured: "Destaques", low: "Menor preço", high: "Maior preço" },
    sort: "Ordenar",
    search: "Pesquisar equipamentos",
    noResults: "Nenhum produto encontrado.",
  },
  en: {
    overline: "CATALOGUE",
    title: "Equipment and supplies",
    subtitle: "Find the right equipment for your business.",
    all: "All",
    sorts: { featured: "Featured", low: "Lowest price", high: "Highest price" },
    sort: "Sort",
    search: "Search equipment",
    noResults: "No products found.",
  },
};

export default function CatalogPage({
  products,
  viewer,
}: {
  products: Product[];
  viewer: StorefrontViewer | null;
}) {
  const { locale, changeLocale } = useStoreLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");
  const t = copy[locale];
  const visible = useMemo(
    () =>
      products
        .filter((p) => category === "all" || p.category === category)
        .filter((p) =>
          p.name[locale].toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : Number(b.featured) - Number(a.featured),
        ),
    [category, locale, products, query, sort],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          products.map((product) => [product.category, product.categoryName[locale]]),
        ).entries(),
      ),
    [locale, products],
  );
  return (
    <main className="min-h-screen bg-background text-foreground">
      <StoreHeader locale={locale} onLocaleChange={changeLocale} viewer={viewer} />
      <section className="border-b border-border bg-store-paper px-5 pb-12 pt-36 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-16">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
            {t.overline}
          </p>
          <h1 className="font-display text-5xl italic sm:text-6xl">{t.title}</h1>
          <p className="mt-5 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-10 lg:px-16">
        <div className="mb-12 flex flex-col gap-8 border-b border-border pb-8">
          <Input
            label={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            prefix={<Search className="size-4" />}
            className="max-w-xl"
          />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Button
                variant="ghost"
                onClick={() => setCategory("all")}
                className={cn(
                  "h-auto rounded-none border-b border-transparent px-0 pb-1 text-[10px] uppercase tracking-widest hover:bg-transparent",
                  category === "all" && "border-foreground",
                )}
              >
                {t.all}
              </Button>
              {categories.map(([slug, name], index) => (
                <Button
                  key={slug}
                  variant="ghost"
                  onClick={() => setCategory(slug)}
                  className={cn(
                    "h-auto rounded-none border-b border-transparent px-0 pb-1 text-[10px] uppercase tracking-widest hover:bg-transparent",
                    category === slug && "border-foreground",
                  )}
                >
                  {`${String.fromCharCode(65 + index)}. ${name}`}
                </Button>
              ))}
            </div>
            <SelectField
              value={sort}
              onValueChange={(value) => setSort(value as Sort)}
              triggerAriaLabel={t.sort}
              options={(Object.keys(t.sorts) as Sort[]).map((k) => ({
                value: k,
                label: t.sorts[k],
              }))}
              triggerClassName="h-9 min-w-40 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-[10px] uppercase tracking-widest shadow-none"
            />
          </div>
        </div>
        {visible.length ? (
          <ProductGrid items={visible} locale={locale} viewer={viewer} />
        ) : (
          <div className="grid min-h-64 place-items-center border-y border-border text-sm text-muted-foreground">
            {t.noResults}
          </div>
        )}
      </section>
      <StoreFooter locale={locale} />
    </main>
  );
}
