"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  LoaderCircle,
  Minus,
  Package,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { StoreFooter, StoreHeader, useStoreLocale } from "@/components/storefront";
import { Button } from "@/components/ui/button";
import { formatMoney, type Product } from "@/lib/products";

const copy = {
  pt: {
    back: "Voltar ao catálogo",
    overline: "Equipamento selecionado",
    indicative: "Preço indicativo",
    per: "por",
    origin: "Origem",
    lead: "Prazo estimado",
    min: "Encomenda mínima",
    quantity: "Quantidade pretendida",
    quote: "Pedir cotação",
    requesting: "A enviar pedido...",
    total: "Total indicativo",
    note: "Transporte, alfândega e condições finais são confirmados na cotação.",
    supply: "Ficha de fornecimento",
    supplyIntro: "Informação essencial para planear a sua compra empresarial.",
    direct: "Fornecimento internacional",
    directNote: "Selecionamos e validamos o fornecedor antes da encomenda.",
    transparent: "Cotação transparente",
    transparentNote: "Recebe o custo final para aprovação antes do pagamento.",
    delivered: "Entrega em São Tomé",
    deliveredNote: "Acompanhamos transporte, documentação e desalfandegamento.",
    login: "Inicie sessão para pedir uma cotação.",
    success: "Pedido de cotação criado com sucesso.",
  },
  en: {
    back: "Back to catalogue",
    overline: "Selected equipment",
    indicative: "Indicative price",
    per: "per",
    origin: "Origin",
    lead: "Estimated lead time",
    min: "Minimum order",
    quantity: "Required quantity",
    quote: "Request a quote",
    requesting: "Sending request...",
    total: "Indicative total",
    note: "Shipping, customs and final terms are confirmed in the quote.",
    supply: "Supply overview",
    supplyIntro: "Essential information to plan your business purchase.",
    direct: "International sourcing",
    directNote: "We select and validate the supplier before the order.",
    transparent: "Transparent quotation",
    transparentNote: "You receive the final cost for approval before payment.",
    delivered: "Delivery in São Tomé",
    deliveredNote: "We manage shipping, documentation and customs clearance.",
    login: "Sign in to request a quote.",
    success: "Quote request created successfully.",
  },
};

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Não foi possível concluir o pedido.";
}

export default function ProductPage({ product }: { product: Product }) {
  const { locale, changeLocale } = useStoreLocale();
  const [quantity, setQuantity] = useState(product.minQty);
  const [requesting, setRequesting] = useState(false);
  const t = copy[locale];
  const money = (value: number) => formatMoney(value, locale, product.currency);

  const requestQuote = async () => {
    setRequesting(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: [{ productId: product.id, quantity }] }),
      });

      if (response.status === 401) throw new Error(t.login);
      if (!response.ok) throw new Error(await responseError(response));
      toast.success(t.success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível pedir a cotação.");
    } finally {
      setRequesting(false);
    }
  };

  const supplyItems = [
    { number: "01", title: t.direct, note: t.directNote },
    { number: "02", title: t.transparent, note: t.transparentNote },
    { number: "03", title: t.delivered, note: t.deliveredNote },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <StoreHeader locale={locale} onLocaleChange={changeLocale} />

      <section className="border-b border-border bg-store-paper pt-20 lg:bg-card">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1500px] lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative flex min-h-[58vh] items-center justify-center bg-store-paper px-6 pb-14 pt-24 before:absolute before:inset-y-0 before:right-full before:w-screen before:bg-store-paper sm:px-12 lg:min-h-[calc(100vh-5rem)] lg:px-16">
            <Link
              href="/catalog"
              className="absolute left-6 top-7 z-20 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.18em] transition-opacity hover:opacity-50 sm:left-12 lg:left-16"
            >
              <ArrowLeft className="size-4" />
              {t.back}
            </Link>

            <div className="absolute left-6 top-20 hidden text-[9px] uppercase tracking-[.26em] text-muted-foreground sm:block lg:left-16">
              {String(product.featured).padStart(2, "0")} / {product.categoryName[locale]}
            </div>
            <div className="absolute size-[76%] max-h-[680px] max-w-[680px] rounded-full border border-border/70 bg-store-mint/70" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-border/50" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-border/50" />
            <img
              src={product.image.src}
              alt={product.name[locale]}
              width={1200}
              height={1200}
              className="relative z-10 max-h-[68vh] w-full max-w-3xl object-contain drop-shadow-[0_35px_45px_rgba(24,48,43,.13)]"
            />
            <p className="absolute bottom-7 right-6 z-10 text-[9px] uppercase tracking-[.24em] text-muted-foreground sm:right-12 lg:right-16">
              Mercado B2B · São Tomé
            </p>
          </div>

          <div className="relative flex items-center bg-card px-6 py-14 after:absolute after:inset-y-0 after:left-full after:w-screen after:bg-card sm:px-12 lg:px-16 xl:px-20">
            <div className="w-full max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-foreground px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-background">
                  {product.categoryName[locale]}
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[.22em] text-muted-foreground">
                  {t.overline}
                </span>
              </div>

              <h1 className="mt-7 max-w-xl text-4xl font-light leading-[1.02] sm:text-5xl xl:text-6xl">
                {product.name[locale]}
              </h1>
              {product.detail[locale] && (
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
                  {product.detail[locale]}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-end justify-between gap-4 border-y border-border py-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[.2em] text-muted-foreground">
                    {t.indicative} · {t.per} {product.unit[locale]}
                  </p>
                  <p className="mt-1 font-display text-5xl italic">{money(product.price)}</p>
                </div>
                <span className="max-w-44 text-right text-[10px] leading-5 text-muted-foreground">
                  {t.note}
                </span>
              </div>

              <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">
                {product.description[locale]}
              </p>

              <dl className="mt-8 grid grid-cols-3 border-y border-border text-xs">
                <div className="border-r border-border py-5 pr-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe2 className="size-3.5" /> {t.origin}
                  </dt>
                  <dd className="mt-2 font-medium">{product.origin[locale]}</dd>
                </div>
                <div className="border-r border-border px-4 py-5">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" /> {t.lead}
                  </dt>
                  <dd className="mt-2 font-medium">{product.leadTime[locale]}</dd>
                </div>
                <div className="py-5 pl-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="size-3.5" /> {t.min}
                  </dt>
                  <dd className="mt-2 font-medium">
                    {product.minQty} {product.unit[locale]}
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                  {t.quantity}
                </p>
                <div className="grid gap-3 sm:grid-cols-[144px_minmax(0,1fr)]">
                  <div className="flex h-13 items-center justify-between border border-border bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((value) => Math.max(product.minQty, value - 1))}
                      aria-label={locale === "pt" ? "Diminuir quantidade" : "Decrease quantity"}
                    >
                      <Minus />
                    </Button>
                    <span className="min-w-10 text-center font-display text-xl italic">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((value) => value + 1)}
                      aria-label={locale === "pt" ? "Aumentar quantidade" : "Increase quantity"}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    onClick={() => void requestQuote()}
                    disabled={requesting}
                    className="h-13 rounded-none text-[10px] uppercase tracking-[.18em]"
                  >
                    {requesting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                    {requesting ? t.requesting : t.quote}
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{t.total}</span>
                  <strong className="font-display text-2xl font-normal italic">
                    {money(product.price * quantity)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
              {t.supply}
            </p>
            <h2 className="mt-4 max-w-sm font-display text-4xl italic sm:text-5xl">
              {t.supplyIntro}
            </h2>
          </div>
          <div className="border-t border-border">
            {supplyItems.map((item) => (
              <article
                key={item.number}
                className="grid gap-4 border-b border-border py-7 sm:grid-cols-[64px_1fr_1.2fr] sm:items-start"
              >
                <span className="font-display text-2xl italic text-muted-foreground">
                  {item.number}
                </span>
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-14 flex items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" />
          {t.note}
        </div>
      </section>

      <StoreFooter locale={locale} />
    </main>
  );
}
