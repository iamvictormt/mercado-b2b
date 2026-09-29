"use client";

import Link from "next/link";
import { AlertCircle, FileSearch, LoaderCircle, RotateCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePanelLocale } from "@/components/panel-locale";
import {
  type AdminSourcingRequest,
  type PaginatedResponse,
  sourcingStatusLabels,
  sourcingStatusLabelsEn,
  sourcingStatusStyles,
} from "@/lib/admin";
import { formatMoney } from "@/lib/products";
import { cn } from "@/lib/utils";

const copy = {
  pt: {
    loadError: "Não foi possível carregar os pedidos.",
    retry: "Tentar novamente",
    emptyTitle: "Ainda não pediu nenhuma pesquisa.",
    emptyText: "Descreva a máquina que procura e acompanhe aqui o trabalho da nossa equipa.",
    find: "Encontrar uma máquina",
    request: "pedido",
    requests: "pedidos",
    newRequest: "Novo pedido",
    refresh: "Atualizar",
    budget: "Orçamento",
    notProvided: "Não indicado",
    quantity: "Quantidade",
    notProvidedFeminine: "Não indicada",
    desiredDate: "Data pretendida",
    notDefined: "Não definida",
  },
  en: {
    loadError: "Requests could not be loaded.",
    retry: "Try again",
    emptyTitle: "You have not submitted a sourcing request yet.",
    emptyText: "Describe the machine you need and track our team’s work here.",
    find: "Find a machine",
    request: "request",
    requests: "requests",
    newRequest: "New request",
    refresh: "Refresh",
    budget: "Budget",
    notProvided: "Not provided",
    quantity: "Quantity",
    notProvidedFeminine: "Not provided",
    desiredDate: "Desired date",
    notDefined: "Not defined",
  },
};

const formatDate = (value: string, locale: "pt" | "en") =>
  new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export function CustomerSourcingRequestList() {
  const locale = usePanelLocale();
  const t = copy[locale];
  const [requests, setRequests] = useState<AdminSourcingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sourcing-requests?pageSize=100", { cache: "no-store" });
      const body = (await response.json()) as PaginatedResponse<AdminSourcingRequest> & {
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? t.loadError);
      setRequests(body.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

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
            onClick={() => void loadRequests()}
          >
            <RotateCw /> {t.retry}
          </Button>
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="grid min-h-72 place-items-center border border-border bg-card p-8 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-store-mint">
            <Search className="size-5" />
          </span>
          <h2 className="mt-5 font-display text-3xl italic">{t.emptyTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.emptyText}</p>
          <Button asChild className="mt-6 rounded-none">
            <Link href="/find-machine">{t.find}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {requests.length} {requests.length === 1 ? t.request : t.requests}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-none">
            <Link href="/find-machine">
              <FileSearch className="size-3.5" /> {t.newRequest}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void loadRequests()}>
            <RotateCw className="size-3.5" /> {t.refresh}
          </Button>
        </div>
      </div>

      {requests.map((request) => (
        <article key={request.id} className="border border-border bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                {request.number} · {formatDate(request.createdAt, locale)}
              </p>
              <h2 className="mt-2 max-w-3xl font-display text-2xl italic leading-tight">
                {request.description}
              </h2>
            </div>
            <span
              className={cn(
                "inline-flex px-3 py-1 text-[10px] font-medium uppercase tracking-widest",
                sourcingStatusStyles[request.status],
              )}
            >
              {(locale === "pt" ? sourcingStatusLabels : sourcingStatusLabelsEn)[request.status]}
            </span>
          </div>

          <dl className="mt-6 grid border-t border-border text-sm sm:grid-cols-3">
            <div className="border-b border-border py-4 sm:border-b-0 sm:border-r sm:pr-4">
              <dt className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                {t.budget}
              </dt>
              <dd className="mt-2 font-medium">
                {request.budget === null
                  ? t.notProvided
                  : formatMoney(Number(request.budget), locale, request.currency)}
              </dd>
            </div>
            <div className="border-b border-border py-4 sm:border-b-0 sm:border-r sm:px-4">
              <dt className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                {t.quantity}
              </dt>
              <dd className="mt-2 font-medium">{request.quantity ?? t.notProvidedFeminine}</dd>
            </div>
            <div className="py-4 sm:pl-4">
              <dt className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                {t.desiredDate}
              </dt>
              <dd className="mt-2 font-medium">
                {request.desiredBy ? formatDate(request.desiredBy, locale) : t.notDefined}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
