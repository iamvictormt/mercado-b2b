"use client";

import Link from "next/link";
import { AlertCircle, FileText, LoaderCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePanelLocale } from "@/components/panel-locale";
import { formatMoney } from "@/lib/products";
import {
  type QuoteListResponse,
  type QuoteRecord,
  quoteProgressIndex,
  quoteProgressSteps,
  quoteProgressStepsEn,
  quoteStatusLabels,
  quoteStatusLabelsEn,
  quoteStatusStyles,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

const copy = {
  pt: {
    loadError: "Não foi possível carregar as cotações.",
    loading: "A carregar cotações…",
    retry: "Tentar novamente",
    emptyTitle: "Ainda não pediu nenhuma cotação.",
    emptyText: "Escolha um produto, indique a quantidade e acompanhe todo o processo aqui.",
    explore: "Explorar catálogo",
    request: "pedido",
    requests: "pedidos",
    refresh: "Atualizar",
    cancelled: "Esta cotação foi cancelada.",
  },
  en: {
    loadError: "Quotes could not be loaded.",
    loading: "Loading quotes…",
    retry: "Try again",
    emptyTitle: "You have not requested any quotes yet.",
    emptyText: "Choose a product, enter the quantity and track the entire process here.",
    explore: "Browse catalogue",
    request: "request",
    requests: "requests",
    refresh: "Refresh",
    cancelled: "This quote has been cancelled.",
  },
};

const formatDate = (value: string, locale: "pt" | "en") =>
  new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export function CustomerQuoteList() {
  const locale = usePanelLocale();
  const t = copy[locale];
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/quotes?pageSize=100", { cache: "no-store" });
      const body = (await response.json()) as QuoteListResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? t.loadError);
      setQuotes(body.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card">
        <div className="text-center text-sm text-muted-foreground">
          <LoaderCircle className="mx-auto mb-3 size-5 animate-spin" />
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card p-6 text-center">
        <div>
          <AlertCircle className="mx-auto mb-3 size-6 text-destructive" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" className="mt-5 rounded-none" onClick={() => void loadQuotes()}>
            <RotateCw /> {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="grid min-h-72 place-items-center border border-border bg-card p-8 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-store-mint">
            <FileText className="size-5" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {quotes.length} {quotes.length === 1 ? t.request : t.requests}
        </p>
        <Button variant="ghost" size="sm" onClick={() => void loadQuotes()}>
          <RotateCw className="size-3.5" /> {t.refresh}
        </Button>
      </div>

      {quotes.map((quote) => {
        const current = quoteProgressIndex(quote.status);
        const cancelled = quote.status === "CANCELLED";
        return (
          <article key={quote.id} className="border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                  {formatDate(quote.createdAt, locale)}
                </p>
                <h2 className="mt-1 font-display text-2xl italic">{quote.number}</h2>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-flex px-3 py-1 text-[10px] font-medium uppercase tracking-widest",
                    quoteStatusStyles[quote.status],
                  )}
                >
                  {(locale === "pt" ? quoteStatusLabels : quoteStatusLabelsEn)[quote.status]}
                </span>
                <p className="mt-2 font-display text-2xl italic">
                  {formatMoney(Number(quote.totalAmount), locale, quote.currency)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quote.items.map((item) => {
                const content = (
                  <>
                    <div className="size-14 shrink-0 overflow-hidden bg-store-paper">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="grid size-full place-items-center">
                          <FileText className="size-4 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {locale === "en" && item.product?.nameEn
                          ? item.product.nameEn
                          : item.productName}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.quantity} ×{" "}
                        {formatMoney(Number(item.unitPrice), locale, quote.currency)}
                      </span>
                    </span>
                  </>
                );

                return item.product ? (
                  <Link
                    key={item.id}
                    href={`/product/${item.product.id}`}
                    className="flex items-center gap-3 border border-border bg-background p-2 transition-colors hover:bg-store-mint/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={item.id} className="flex items-center gap-3 border border-border p-2">
                    {content}
                  </div>
                );
              })}
            </div>

            {quote.notes && (
              <p className="mt-5 border-l-2 border-primary pl-4 text-xs leading-6 text-muted-foreground">
                {quote.notes}
              </p>
            )}

            {cancelled ? (
              <p className="mt-6 border-t border-border pt-4 text-xs text-destructive">
                {t.cancelled}
              </p>
            ) : (
              <div className="mt-7 grid grid-cols-4 gap-2">
                {(locale === "pt" ? quoteProgressSteps : quoteProgressStepsEn).map((step, index) => (
                  <div key={step}>
                    <div className={cn("h-1", index <= current ? "bg-primary" : "bg-muted")} />
                    <p
                      className={cn(
                        "mt-2 text-[10px] sm:text-xs",
                        index <= current ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
