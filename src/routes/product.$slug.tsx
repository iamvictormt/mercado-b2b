"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe2,
  Minus,
  Package,
  Plus,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatMoney, type Product, type StoreLocale } from "@/lib/products";
import { cn } from "@/lib/utils";

export default function ProductPage({ product }: { product: Product }) {
  const [locale, setLocale] = useState<StoreLocale>("pt");
  const [quantity, setQuantity] = useState(product.minQty);
  const t =
    locale === "pt"
      ? {
          back: "Voltar ao catálogo",
          indicative: "Preço indicativo por",
          origin: "Origem",
          lead: "Prazo estimado",
          min: "Quantidade mínima",
          quantity: "Quantidade",
          quote: "Pedir cotação",
          total: "Total indicativo",
          note: "O preço final, transporte e alfândega são confirmados na cotação.",
          pending: "As cotações serão ligadas ao novo banco na próxima etapa.",
        }
      : {
          back: "Back to catalogue",
          indicative: "Indicative price per",
          origin: "Origin",
          lead: "Estimated lead time",
          min: "Minimum quantity",
          quantity: "Quantity",
          quote: "Request quote",
          total: "Indicative total",
          note: "Final price, shipping and customs are confirmed in the quote.",
          pending: "Quotes will be connected to the new database in the next step.",
        };
  const money = (v: number) => formatMoney(v, locale, product.currency);
  const quote = () => toast.info(t.pending);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center px-5 sm:px-10 lg:px-16">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic">Mercado</span>
            <span className="text-sm font-semibold tracking-widest">B2B</span>
            <span className="size-1 rounded-full bg-primary" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale("pt")}
              className={cn(locale !== "pt" && "text-muted-foreground")}
            >
              PT
            </Button>
            <span className="text-border">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale("en")}
              className={cn(locale !== "en" && "text-muted-foreground")}
            >
              EN
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link
                href="/auth"
                aria-label={locale === "pt" ? "Entrar ou criar conta" : "Sign in or create account"}
              >
                <UserRound className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid min-h-screen pt-20 lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-store-paper p-8 sm:p-14 lg:min-h-[calc(100vh-5rem)]">
          <Link
            href="/catalog"
            className="absolute left-6 top-7 z-10 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest sm:left-10"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
          <div className="absolute size-[70%] rounded-full bg-store-mint" />
          <img
            src={product.image.src}
            alt={product.name[locale]}
            width={1024}
            height={1024}
            className="relative max-h-[72vh] w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="flex items-center bg-card px-7 py-16 sm:px-14 lg:px-20">
          <div className="w-full max-w-lg">
            <p className="mb-5 inline-flex bg-foreground px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-background">
              {product.categoryName[locale]}
            </p>
            <h1 className="text-4xl font-light leading-tight sm:text-5xl">
              {product.name[locale]}
            </h1>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.indicative} {product.unit[locale]}
            </p>
            <p className="font-display text-4xl italic">{money(product.price)}</p>
            <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground">
              {product.description[locale]}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-5 text-xs">
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Globe2 className="size-3.5" />
                  {t.origin}
                </dt>
                <dd className="mt-1 font-medium">{product.origin[locale]}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />
                  {t.lead}
                </dt>
                <dd className="mt-1 font-medium">{product.leadTime[locale]}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Package className="size-3.5" />
                  {t.min}
                </dt>
                <dd className="mt-1 font-medium">
                  {product.minQty} {product.unit[locale]}
                </dd>
              </div>
            </dl>
            <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.quantity}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((v) => Math.max(product.minQty, v - 1))}
                  aria-label="-"
                >
                  <Minus />
                </Button>
                <span className="w-10 text-center text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((v) => v + 1)}
                  aria-label="+"
                >
                  <Plus />
                </Button>
              </div>
              <Button
                onClick={quote}
                className="h-12 flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90"
              >
                {t.quote}
                <ArrowRight />
              </Button>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              {t.total}:{" "}
              <strong className="text-foreground">{money(product.price * quantity)}</strong> ·{" "}
              {t.note}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
