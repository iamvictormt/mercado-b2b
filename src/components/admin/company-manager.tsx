"use client";

import { AlertCircle, Building2, LoaderCircle, RotateCw, Search } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePanelLocale } from "@/components/panel-locale";
import type { AdminCompany, PaginatedResponse } from "@/lib/admin";
import { formatMoney } from "@/lib/products";
import { cn } from "@/lib/utils";

const formatVolumes = (totals: AdminCompany["quoteTotals"], locale: "pt" | "en") =>
  totals.length
    ? totals.map(({ total, currency }) => formatMoney(total, locale, currency)).join(" · ")
    : "—";

const copy = {
  pt: {
    loadError: "Não foi possível carregar as empresas.", searchPlaceholder: "Pesquisar por empresa, e-mail ou número fiscal", search: "Pesquisar", companies: "empresas", refresh: "Atualizar", retry: "Tentar novamente", noResult: "Nenhuma empresa encontrada.", empty: "Ainda não existem empresas.", active: "Ativa", inactive: "Inativa", noEmail: "Sem e-mail", noPhone: "Sem telefone", quotes: "cotações", searches: "pesquisas", users: "utilizadores", headings: ["Empresa", "Contacto", "Telefone", "Estado", "Cotações", "Pesquisas", "Volume total"], taxId: "NIF",
  },
  en: {
    loadError: "Companies could not be loaded.", searchPlaceholder: "Search by company, email or tax number", search: "Search", companies: "companies", refresh: "Refresh", retry: "Try again", noResult: "No companies found.", empty: "There are no companies yet.", active: "Active", inactive: "Inactive", noEmail: "No email", noPhone: "No phone", quotes: "quotes", searches: "searches", users: "users", headings: ["Company", "Contact", "Phone", "Status", "Quotes", "Searches", "Total volume"], taxId: "Tax ID",
  },
};

export function CompanyManager() {
  const locale = usePanelLocale();
  const t = copy[locale];
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (query) params.set("q", query);
      const response = await fetch(`/api/companies?${params}`, { cache: "no-store" });
      const body = (await response.json()) as PaginatedResponse<AdminCompany> & { error?: string };
      if (!response.ok) throw new Error(body.error ?? t.loadError);
      setCompanies(body.items);
      setTotal(body.pagination.total);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [query, t.loadError]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border border-border bg-store-paper/50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <form onSubmit={submitSearch} className="flex w-full max-w-xl gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
            prefix={<Search className="size-4" />}
            controlClassName="rounded-none"
          />
          <Button type="submit" variant="outline" className="h-12 rounded-none px-5">
            {t.search}
          </Button>
        </form>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="text-xs text-muted-foreground">{total} {t.companies}</span>
          <Button variant="ghost" size="sm" onClick={() => void loadCompanies()}>
            <RotateCw className="size-3.5" /> {t.refresh}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-64 place-items-center border border-border bg-card">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="grid min-h-64 place-items-center border border-border bg-card p-8 text-center">
          <div>
            <AlertCircle className="mx-auto size-6 text-destructive" />
            <p className="mt-3 text-sm">{error}</p>
            <Button
              variant="outline"
              className="mt-5 rounded-none"
              onClick={() => void loadCompanies()}
            >
              <RotateCw /> {t.retry}
            </Button>
          </div>
        </div>
      ) : !companies.length ? (
        <div className="grid min-h-64 place-items-center border border-border bg-card p-8 text-center">
          <div>
            <Building2 className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 font-display text-2xl italic">
              {query ? t.noResult : t.empty}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {companies.map((company) => (
              <article key={company.id} className="border border-border bg-card p-5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium">{company.name}</h2>
                  <span
                    className={cn(
                      "px-2 py-1 text-[9px] uppercase tracking-widest",
                      company.status === "ACTIVE"
                        ? "bg-store-mint text-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {company.status === "ACTIVE" ? t.active : t.inactive}
                  </span>
                </div>
                <p className="mt-3 break-all text-muted-foreground">
                  {company.email ?? t.noEmail}
                </p>
                <p className="mt-1 text-muted-foreground">{company.phone ?? t.noPhone}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <span>{company._count.quotes} {t.quotes}</span>
                  <strong className="text-right">{formatVolumes(company.quoteTotals, locale)}</strong>
                  <span>{company._count.sourcingRequests} {t.searches}</span>
                  <span className="text-right text-muted-foreground">
                    {company._count.users} {t.users}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto border border-border bg-card md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  {t.headings.map((heading) => (
                    <th key={heading} className="p-4 font-normal">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-t border-border align-top">
                    <td className="p-4">
                      <p className="font-medium">{company.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.taxId} {company.taxId ?? "—"}
                      </p>
                    </td>
                    <td className="p-4">{company.email ?? "—"}</td>
                    <td className="p-4 whitespace-nowrap">{company.phone ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-[9px] uppercase tracking-widest",
                          company.status === "ACTIVE"
                            ? "bg-store-mint text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {company.status === "ACTIVE" ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="p-4">{company._count.quotes}</td>
                    <td className="p-4">{company._count.sourcingRequests}</td>
                    <td className="p-4 font-medium">{formatVolumes(company.quoteTotals, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
