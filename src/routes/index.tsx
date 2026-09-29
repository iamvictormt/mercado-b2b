"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  ProductGrid,
  StoreFooter,
  StoreHeader,
  type StorefrontViewer,
  useStoreLocale,
} from "@/components/storefront";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

const copy = {
  pt: {
    edition: "PLATAFORMA DE COMPRAS EMPRESARIAIS",
    title: "Abastecimento para",
    italic: "negócios em São Tomé.",
    subtitle:
      "A forma mais simples de empresas em São Tomé comprarem diretamente de fornecedores internacionais.",
    discover: "Ver catálogo",
    find: "Encontra-me uma máquina",
    featured: "Destaques",
    collection: "Escolhidos para o seu negócio",
    emptyFeatured: "Selecione produtos em destaque no painel administrativo.",
    all: "Explorar todo o catálogo",
    services: [
      ["Fornecedores internacionais", "China, Índia, Europa e Médio Oriente"],
      ["Cotação transparente", "Preço final confirmado antes de pagar"],
      ["Entrega em São Tomé", "Tratamos do transporte e alfândega"],
    ],
  },
  en: {
    edition: "BUSINESS PROCUREMENT PLATFORM",
    title: "Supplies for",
    italic: "businesses in São Tomé.",
    subtitle:
      "The simplest way for businesses in São Tomé to buy directly from international suppliers.",
    discover: "Browse catalogue",
    find: "Find me a machine",
    featured: "Featured",
    collection: "Selected for your business",
    emptyFeatured: "Choose featured products in the administration panel.",
    all: "Explore the full catalogue",
    services: [
      ["International suppliers", "China, India, Europe and Middle East"],
      ["Transparent quotes", "Final price confirmed before you pay"],
      ["Delivered to São Tomé", "We handle shipping and customs"],
    ],
  },
};

export default function Storefront({
  products,
  viewer,
}: {
  products: Product[];
  viewer: StorefrontViewer | null;
}) {
  const { locale, changeLocale } = useStoreLocale();
  const t = copy[locale];
  const featured = products.filter((product) => product.featured).slice(0, 6);
  const heroProduct = featured[0] ?? products[0];
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <StoreHeader locale={locale} onLocaleChange={changeLocale} viewer={viewer} />
      <section className="relative bg-store-paper pt-20">
        <div className="mx-auto grid max-w-[1500px] items-center px-5 py-12 sm:px-10 lg:min-h-[min(720px,calc(100vh-5rem))] lg:grid-cols-[.9fr_1.1fr] lg:px-16">
          <div className="relative z-10 max-w-xl py-10">
            <p className="mb-7 text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
              {t.edition}
            </p>
            <h1 className="text-5xl font-light leading-[.95] sm:text-7xl">
              {t.title}
              <br />
              <em className="font-display font-normal">{t.italic}</em>
            </h1>
            <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground">{t.subtitle}</p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button
                asChild
                className="h-12 rounded-none px-7 text-[10px] uppercase tracking-widest"
              >
                <Link href="/catalog">
                  {t.discover}
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="group h-auto gap-4 p-0 text-[10px] font-semibold uppercase tracking-widest hover:bg-transparent"
              >
                <Link href="/find-machine">
                  {t.find}
                  <span className="h-px w-10 bg-foreground transition-all group-hover:w-14" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative flex min-h-[300px] items-center justify-center lg:h-[65vh]">
            {/* <div className="absolute inset-[8%] rounded-full bg-store-mint" /> */}
            {heroProduct ? (
              <img
                src={heroProduct.image.src}
                alt={heroProduct.name[locale]}
                width={1024}
                height={1024}
                className="relative h-full max-h-[600px] w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="relative grid aspect-square w-full max-w-lg place-items-center rounded-full border border-border bg-store-mint/50 px-12 text-center">
                <p className="font-display text-3xl italic text-muted-foreground">
                  {locale === "pt"
                    ? "O primeiro produto começa aqui."
                    : "Your first product starts here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="grid border-y border-border bg-card sm:grid-cols-3">
        {t.services.map(([name, desc]) => (
          <div
            key={name}
            className="border-b border-border px-8 py-8 text-center last:border-0 sm:border-b-0 sm:border-r"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest">{name}</p>
            <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-10 lg:px-16">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
              {t.featured}
            </p>
            <h2 className="font-display text-5xl italic">{t.collection}</h2>
          </div>
          <Button asChild variant="ghost" className="gap-2 text-[10px] uppercase tracking-widest">
            <Link href="/catalog">
              {t.all}
              <ArrowRight />
            </Link>
          </Button>
        </div>
        {featured.length ? (
          <ProductGrid items={featured} locale={locale} viewer={viewer} />
        ) : (
          <div className="grid min-h-56 place-items-center border-y border-border text-sm text-muted-foreground">
            {t.emptyFeatured}
          </div>
        )}
        <div className="mt-16 text-center">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none px-8 text-[10px] uppercase tracking-widest"
          >
            <Link href="/catalog">
              {t.all}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <StoreFooter locale={locale} />
    </main>
  );
}
