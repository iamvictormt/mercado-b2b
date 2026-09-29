"use client";

import { AlertCircle, Building2, FileSearch, FileText, LoaderCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePanelLocale } from "@/components/panel-locale";
import type { AdminSummaryResponse } from "@/lib/admin";
import { formatMoney } from "@/lib/products";

const formatDay = (value: string, locale: "pt" | "en") =>
  new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-GB", { weekday: "short" })
    .format(new Date(`${value}T12:00:00.000Z`))
    .replace(".", "");

const formatVolumes = (
  volumes: AdminSummaryResponse["monthlyVolumes"],
  locale: "pt" | "en",
) => {
  if (!volumes.length) return formatMoney(0, locale);
  return volumes.map(({ total, currency }) => formatMoney(total, locale, currency)).join(" · ");
};

const copy = {
  pt: {
    loadError: "Não foi possível carregar o resumo.",
    retry: "Tentar novamente",
    volume: "Volume cotado no mês",
    openQuotes: "Cotações abertas",
    activeCompanies: "Empresas ativas",
    openSearches: "Pesquisas em aberto",
    refresh: "Atualizar resumo",
    activity: "Atividade recente",
    lastDays: "Cotações dos últimos 7 dias",
    period: "pedidos no período",
    chartTitle: "cotações em",
  },
  en: {
    loadError: "The overview could not be loaded.",
    retry: "Try again",
    volume: "Quoted volume this month",
    openQuotes: "Open quotes",
    activeCompanies: "Active companies",
    openSearches: "Open sourcing requests",
    refresh: "Refresh overview",
    activity: "Recent activity",
    lastDays: "Quotes over the last 7 days",
    period: "requests during this period",
    chartTitle: "quotes on",
  },
};

export function AdminSummary() {
  const locale = usePanelLocale();
  const t = copy[locale];
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      const body = (await response.json()) as AdminSummaryResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? t.loadError);
      setData(body);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const maxActivity = useMemo(
    () => Math.max(...(data?.quoteActivity.map((item) => item.count) ?? [0]), 1),
    [data],
  );

  if (loading) {
    return (
      <div className="grid min-h-72 place-items-center border border-border bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid min-h-72 place-items-center border border-border bg-card p-8 text-center">
        <div>
          <AlertCircle className="mx-auto size-6 text-destructive" />
          <p className="mt-3 text-sm">{error ?? t.loadError}</p>
          <Button
            variant="outline"
            className="mt-5 rounded-none"
            onClick={() => void loadSummary()}
          >
            <RotateCw /> {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  const cards = [
    { label: t.volume, value: formatVolumes(data.monthlyVolumes, locale), icon: FileText },
    {
      label: t.openQuotes,
      value: data.openQuotes.toLocaleString(locale === "pt" ? "pt-PT" : "en-GB"),
      icon: FileText,
    },
    {
      label: t.activeCompanies,
      value: data.activeCompanies.toLocaleString(locale === "pt" ? "pt-PT" : "en-GB"),
      icon: Building2,
    },
    {
      label: t.openSearches,
      value: data.openSourcingRequests.toLocaleString(locale === "pt" ? "pt-PT" : "en-GB"),
      icon: FileSearch,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => void loadSummary()}>
          <RotateCw className="size-3.5" /> {t.refresh}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }, index) => (
          <article
            key={label}
            className="relative overflow-hidden border border-border bg-card p-6"
          >
            <span className="absolute right-4 top-4 text-[10px] tracking-[.2em] text-muted-foreground">
              0{index + 1}
            </span>
            <Icon className="size-4 text-muted-foreground" />
            <p className="mt-8 text-xs uppercase tracking-[.16em] text-muted-foreground">{label}</p>
            <p className="mt-3 break-words font-display text-3xl leading-tight">{value}</p>
          </article>
        ))}
      </div>

      <article className="border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-muted-foreground">
              {t.activity}
            </p>
            <h2 className="mt-2 font-display text-3xl italic">{t.lastDays}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.quoteActivity.reduce((sum, item) => sum + item.count, 0)} {t.period}
          </p>
        </div>

        <div className="mt-10 flex h-52 items-end gap-3 border-b border-border px-1">
          {data.quoteActivity.map((item) => {
            const height = item.count ? Math.max((item.count / maxActivity) * 100, 10) : 2;
            return (
              <div
                key={item.date}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  {item.count}
                </span>
                <div
                  className="w-full bg-primary/75 transition-all duration-500 group-hover:bg-primary"
                  style={{ height: `${height}%` }}
                  title={`${item.count} ${t.chartTitle} ${item.date}`}
                />
                <span className="pb-3 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                  {formatDay(item.date, locale)}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
